## Why

The backend has a solid foundation (core infrastructure, database models, migrations, seed data) but all business logic files — schemas, repositories, services, and routers — are empty placeholders across every module. The codebase lacks consistent patterns, has naming field inconsistencies (mixed Spanish/English), and architectural confusion in the `auth/` and `admin/` modules. Without established patterns, ongoing development will produce inconsistent, hard-to-maintain code. This change establishes and applies consistent backend patterns across all modules so the team has a clear, repeatable architecture to build on.

## What Changes

- Establish **consistent architectural patterns** for schemas, repositories, services, and routers
- Implement **all empty module files** following those patterns (schemas, repositories, services, routers)
- Create **base CRUD repository and service classes** in `core/` to eliminate duplication
- Implement **Pydantic schema conventions** (`EntityCreate`, `EntityUpdate`, `EntityRead`, `EntityList`) across all modules
- Create a **module registration pattern** connecting modules to the API layer (`api/v1/`)
- Clean up `modules/auth/` — implement using `User` model, remove its empty `model.py`
- Clean up `modules/admin/` — restructure as a feature module using `User` with `role=ADMIN`
- Standardize **field naming convention** across all models
- Establish **error handling patterns** (domain exceptions, error responses)
- Wire all module routers into `main.py` with consistent prefixing and tagging

## Capabilities

### New Capabilities

- `backend-patterns`: Defines the architectural standards, conventions, and patterns for the entire backend — schema conventions, repository/service layer contracts, router registration, error handling, and naming standards
- `user-management`: User CRUD, profile management, role-based access (modules: `usuarios`)
- `product-catalog`: Product CRUD, search, listing with category filtering (modules: `productos`, `categorias`)
- `order-processing`: Order creation, lifecycle management, status transitions (modules: `pedidos`)
- `payment-handling`: Payment processing, status tracking, refund support (modules: `pagos`)
- `address-management`: User address CRUD, default address, validation (modules: `direcciones`)
- `authentication`: Login, registration, token management, current user (modules: `auth`)
- `admin-panel`: Admin-only operations, dashboard, user management (modules: `admin`)
- `session-management`: Refresh token lifecycle, revocation (modules: `refreshtokens`)

### Modified Capabilities

- *(None — this is the first wave of implementation; no existing specs to modify)*

## Impact

- **Backend code** — Every module's `schemas.py`, `repository.py`, `service.py`, `router.py` will be implemented
- **Core infrastructure** — New base classes in `core/` (base repository, base service)
- **API layer** — Module routers wired into `api/v1/` and `main.py`
- **Auth module** — Restructured (remove `model.py`, use `User` model from `usuarios`)
- **Admin module** — Restructured as a feature module
- **Dependencies** — No new external dependencies; uses existing FastAPI, SQLAlchemy, Pydantic stack
- **Migrations** — No schema changes expected (models already exist)
