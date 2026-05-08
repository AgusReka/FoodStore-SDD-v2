# Design: Backend Patterns

## Context

The backend is built on FastAPI + SQLAlchemy 2.0 async with a Feature-First module layout under `backend/modules/`. Core infrastructure (`core/config.py`, `core/database.py`, `core/security.py`, `core/base.py`) is well-structured, and all database models are implemented with a consistent SQLAlchemy 2.0 pattern (`Mapped`/`mapped_column`). Alembic migrations and seed data are in place.

However, every module follows the same file structure (`model.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`) but **only `model.py` files have content** — all other files are empty placeholders. The `auth/` and `admin/` modules have empty `model.py` files with architectural confusion (auth shouldn't have its own model; admin is a role, not an entity). Field naming is inconsistent (mixed Spanish and English). No module routers are wired into `main.py`.

This change establishes consistent patterns and implements all placeholder files across 9 modules.

## Goals / Non-Goals

**Goals:**
- Establish consistent schema, repository, service, and router patterns across all modules
- Implement all empty `schemas.py`, `repository.py`, `service.py`, and `router.py` files
- Create shared base classes in `core/` for CRUD repositories and services to eliminate duplication
- Wire all modules into the API layer with consistent prefixing, tagging, and dependency injection
- Restructure `auth/` module to use the `User` model (remove empty `model.py`)
- Restructure `admin/` module as a feature module (not an entity)
- Standardize field naming conventions across models and schemas
- Establish global error handling middleware and domain exception patterns
- Add Pydantic `model_config` and schema documentation conventions

**Non-Goals:**
- New database models or migrations (existing schema is sufficient)
- New external dependencies
- Authentication/authorization logic changes (existing JWT flow stays)
- Performance optimization or query tuning
- Test coverage (will be addressed in a separate change)
- Frontend integration

## Decisions

### Decision 1: Pydantic v2 Schema Pattern (EntityCreate / EntityUpdate / EntityRead)

**Chosen:** Pydantic v2 `BaseModel` with `EntityCreate`, `EntityUpdate`, `EntityRead` per module.

**Rationale:**
- Pydantic v2 is already a dependency (FastAPI ships with it)
- `EntityCreate` → input for POST (required fields, validation)
- `EntityUpdate` → input for PATCH/PUT (all fields optional via `Optional[...]`)
- `EntityRead` → response model (includes `id`, `created_at`, `updated_at`)
- `EntityList` → paginated wrapper with `items: list[EntityRead]`, `total: int`, `page: int`, `size: int`
- This pattern is standard in FastAPI ecosystems, predictable, and generates clean OpenAPI docs

**Alternatives considered:**
- Single schema per entity (rejected: conflates input/output, prevents field hiding for responses)
- SQLModel (rejected: codebase uses pure SQLAlchemy, not SQLModel; adding it would be a new dependency)

### Decision 2: Repository Pattern with Base CRUD

**Chosen:** Abstract base repository class `BaseRepository[ModelT]` in `core/repository.py` providing `get`, `get_all`, `create`, `update`, `delete`, `paginate`. Per-module repositories inherit and add custom query methods.

**Rationale:**
- Eliminates boilerplate — 80% of operations are standard CRUD
- Enforces consistent method signatures across modules
- Type-safe via generic `ModelT: SQLAlchemy model`
- Uses async SQLAlchemy 2.0 `SELECT` style throughout

**Alternatives considered:**
- Raw SQLAlchemy calls in services (rejected: couples business logic to ORM API, harder to test)
- Generic viewsets like DRF (rejected: too opinionated, hides too much)

### Decision 3: Service Layer as Business Logic Orchestrator

**Chosen:** Per-module service classes that accept repositories via dependency injection. Services contain validation beyond schema-level, business rules, and cross-entity coordination.

**Rationale:**
- Keeps routers thin (request/response handling only)
- Keeps repositories focused on data access
- Services are the natural place for domain rules (e.g., "cannot cancel order after shipped")
- Makes business logic testable independently of HTTP

### Decision 4: Router Registration via `main.py` Explicit Imports

**Chosen:** Each module exports `router` from `__init__.py`. `main.py` explicitly imports and includes each router with `prefix="/api/v1/<module>"` and `tags=["<Module>"]`.

**Rationale:**
- Explicit > implicit — clear traceability of which routes are registered
- Easy to enable/disable modules by commenting out a line
- Consistent URL prefixing (`/api/v1/usuarios`, `/api/v1/productos`)
- Tags auto-group endpoints in OpenAPI docs

**Alternatives considered:**
- Auto-discovery (rejected: magic, harder to debug, order-dependent)
- APIRouter per module with `prefix` in the router itself (used as well — `prefix` on module `APIRouter` for internal path organization, but final prefix resolved at `main.py` inclusion)

### Decision 5: Naming Standardization — English Fields, Spanish Tables

**Chosen:**
- Table names stay in **Spanish** (existing `usuarios`, `productos`, `pedidos` — would break migration to rename)
- Column/field names in **English** (`email`, `is_active`, `full_name` — consistent with code conventions)
- Schema class names in **English** (`UserCreate`, `ProductRead`)
- Endpoint paths in **Spanish** (`/api/v1/usuarios`, `/api/v1/productos`)

**Rationale:**
- Existing migration already uses Spanish table names — renaming would require a breaking migration
- English field names align with Python/SQLAlchemy conventions and the rest of the codebase
- Endpoint paths in Spanish match the existing table name convention and domain language

### Decision 6: Auth Module — No Own Model, Uses User with Role

**Chosen:** `modules/auth/` handles authentication logic (login, register, token refresh, logout, current user) without its own database model. It imports and uses the `User` model from `modules/usuarios/`.

**Rationale:**
- Authentication is a behavior/cross-cutting concern, not a domain entity
- User data already lives in the `usuarios` table
- Admin role is handled via `User.role == UserRole.ADMIN` — no separate admin entity

**What changes:**
- Delete empty `modules/auth/model.py` (no model class was defined)
- Replace with `from backend.modules.usuarios.model import User`
- Move refresh token logic to its own `modules/refreshtokens/` (already exists)

### Decision 7: Error Handling — Domain Exceptions + Global Handler

**Chosen:** Custom `HTTPException` subclasses (`NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`, `ValidationError`) that routers/services raise. A global FastAPI exception handler middleware catches them and returns consistent JSON error responses.

**Rationale:**
- Single pattern for all error responses across all modules
- Avoids scattered `raise HTTPException(...)` with inconsistent status codes and messages
- Makes error responses machine-parseable (consistent `{ "detail": "...", "code": "..." }` format)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large diff from implementing 9 modules at once could be hard to review | Each module has identical structure — review one module's pattern, then skim the rest for consistency |
| Field naming changes (Spanish → English) could break frontend expectations | No frontend exists yet; this is the right time to standardize |
| Auth/Admin restructure could break auth flow | Auth module has no working code yet (all empty files) — restructure is safe now |
| Base repository abstraction may not fit all query patterns | Per-module repositories can bypass base class for custom queries; base is a helper, not a constraint |
| Pydantic schema convention may produce verbose files | Keep schemas focused — one file per module, not per entity; use `model_config` for shared settings |
