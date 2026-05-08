## Context

The Food Store backend uses **FastAPI + SQLAlchemy 2.0 async** with **PostgreSQL**. The project has a well-defined feature-first directory structure with 9 domain modules (auth, usuarios, productos, categorias, pedidos, pagos, direcciones, admin, refreshtokens), each containing stubs for model.py, schemas.py, repository.py, service.py, and router.py — all empty.

The core infrastructure is in place:
- `backend/core/base.py` — `Base(DeclarativeBase)` defined
- `backend/core/database.py` — async engine, session factory, `get_db()` dependency
- `backend/core/config.py` — pydantic-settings with DATABASE_URL
- `backend/main.py` — creates tables on startup via `Base.metadata.create_all` (development only)

However, Alembic is **not configured** (empty `db/alemmbic/`, no `alembic.ini`), no actual model classes exist, no seed data, and the current `main.py` approach of `Base.metadata.create_all` is not suitable for production-grade schema management.

## Goals / Non-Goals

**Goals:**
- Define complete SQLAlchemy model classes for all 9 domain entities with proper relationships, constraints, and indexes
- Configure Alembic for async database migrations
- Create an initial migration that generates all tables
- Implement a seed script with development/test data
- Ensure the database layer is ready for all subsequent feature work
- Maintain backward compatibility with existing core infrastructure

**Non-Goals:**
- Implementing business logic (services, repositories) — those belong in subsequent changes
- Defining Pydantic schemas — those belong in subsequent changes per module
- API endpoint implementation — depends on schemas and services
- Production deployment configuration — separate concern
- Connection pooling with pgBouncer — will be addressed when scaling

## Decisions

### Decision 1: Alembic with async support via `run_async`

**Choice:** Use Alembic's async pattern with `AsyncEngine` and `run_async()`.

**Rationale:**
- The entire backend uses async SQLAlchemy; Alembic must match
- Alembic 1.13+ supports async via `run_async()` helper in env.py
- The existing engine in `database.py` is already async (`create_async_engine`)
- Avoids mixing sync and async patterns

**Configuration Layout:**
```
backend/
├── alembic.ini              ← points to db/alembic/ as script_location
└── db/
    └── alembic/
        ├── env.py           ← async Alembic environment
        ├── script.py.mako   ← migration template
        └── versions/        ← migration files
```

**Alternative Considered:** Sync-only Alembic with a separate sync engine URL.
- Rejected: Adds complexity with two engine configurations and potential mismatch with async models.

### Decision 2: Models defined per module (Feature-First)

**Choice:** Each domain module defines its own model class in `model.py`, importing `Base` from `core.base`.

**Rationale:**
- Follows the established project architecture (feature-first)
- Each module is self-contained: a developer can understand the full module by looking at one directory
- Clear ownership boundaries
- Already expected by the stub structure (each module has `model.py`)

**Model Locations:**
| Module | Model |
|--------|-------|
| `modules/usuarios/model.py` | `User` |
| `modules/refreshtokens/model.py` | `RefreshToken` |
| `modules/productos/model.py` | `Product` |
| `modules/categorias/model.py` | `Category` |
| `modules/pedidos/model.py` | `Order`, `OrderItem` |
| `modules/pagos/model.py` | `Payment` |
| `modules/direcciones/model.py` | `Address` |
| `modules/auth/model.py` | (re-exports or extends User) |
| `modules/admin/model.py` | (admin-specific views/queries, no new tables) |

**Alternative Considered:** Single `core/models/` file with all models.
- Rejected: Violates feature-first principle; creates a God file that makes merge conflicts likely.

### Decision 3: UUID primary keys throughout

**Choice:** All entities use UUID primary keys generated server-side with `uuid.uuid4()`.

**Rationale:**
- Prevents ID enumeration attacks (vs auto-increment integers)
- Supports distributed ID generation if microservices emerge
- Consistent across all entities — simpler mental model
- SQLAlchemy's `UUID` type or `Uuid` (PG native) handles this efficiently

**Implementation:**
```python
import uuid
from sqlalchemy import Uuid
from sqlalchemy.orm import mapped_column

id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
```

### Decision 4: Enum types as Python enums with SQLAlchemy Enum

**Choice:** Use Python `enum.Enum` classes mapped to PostgreSQL `ENUM` types via SQLAlchemy.

**Enums needed:**
- `UserRole`: admin, cliente
- `OrderStatus`: pendiente, confirmado, preparando, enviado, entregado, cancelado
- `PaymentMethod`: efectivo, transferencia, mercadopago
- `PaymentStatus`: pendiente, aprobado, rechazado, reembolsado

### Decision 5: Alembic env.py references models via import

**Choice:** The Alembic `env.py` imports all model modules to register them with `Base.metadata` for autogeneration.

**Rationale:**
- `alembic revision --autogenerate` needs models registered on `Base.metadata`
- Importing models is the standard Alembic pattern
- A `target_metadata` variable in `env.py` points to `Base.metadata`
- New models are auto-discovered when their module is imported

### Decision 6: Seed script uses `AsyncSession` directly

**Choice:** The seed script creates an `AsyncSession` directly (not via `get_db()` dependency) and checks for existing data before inserting.

**Rationale:**
- Seed scripts run outside the request cycle; dependency injection is inappropriate
- Idempotent: verify-before-insert pattern prevents duplicates on re-run
- Use `MERGE` or `INSERT ... ON CONFLICT DO NOTHING` where possible
- Admin user and sample data are always needed for development

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Circular imports** between modules referencing models (e.g., Product → Category, Order → User) | Use string-based relationships (`"User"` instead of `User`) and late-binding patterns. All cross-module refs use strings. |
| **Alembic autogenerate misses changes** if models aren't imported in env.py | Maintain an explicit import block in env.py that imports ALL model modules. Add a CI check. |
| **UUID performance** compared to auto-increment | UUIDs use more storage (16 vs 4 bytes) and have worse index locality. Acceptable for this scale; use UUID v7 (time-ordered) if performance becomes a concern. |
| **Large initial migration** — creating 9+ tables in one migration | Manageable since this is the initial schema. Future migrations will be incremental. |
| **Seed script duplicates** on re-run | Implement idempotent patterns: check existence before insert, use `get_or_create` semantics. |
| **Alembic + async complexity** — the async setup is more complex than sync | Use the well-documented `run_async()` pattern from Alembic docs. Pin the working configuration. |

## Migration Plan

1. Create `alembic.ini` at `backend/` root pointing to `db/alembic/`
2. Create `backend/db/alembic/env.py` with async support and `target_metadata = Base.metadata`
3. Create `backend/db/alembic/script.py.mako` migration template
4. Define all model classes in their respective module `model.py` files
5. Import all model modules in `env.py` to register metadata
6. Run `alembic revision --autogenerate -m "initial_schema"` to generate initial migration
7. Review and verify the generated migration
8. Update `main.py` to remove `Base.metadata.create_all` and add Alembic upgrade note
9. Implement the seed script in `db/seed.py`
10. Test: run `alembic upgrade head`, verify tables, run seed, verify data

## Open Questions

- Should we add `updated_at` triggers or handle timestamps purely at the application layer?
  → **Resolution**: Application-layer timestamps via SQLAlchemy `onupdate` for simplicity.
- Should `backend/modules/auth/model.py` define its own tables or re-use User from usuarios?
  → **Resolution**: Auth re-uses User model. Auth model.py will re-export and add any auth-specific mixins if needed.
- Is `admin` a user role or a separate entity?
  → **Resolution**: `User.role` enum handles `admin` vs `cliente`. Admin module provides admin-specific queries/views, not a separate table.
