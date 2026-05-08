# Spec: backend-patterns

## ADDED Requirements

### Requirement: Schema naming convention

Every module SHALL define Pydantic v2 schemas following the `EntityCreate`, `EntityUpdate`, `EntityRead`, and `EntityList` naming convention.

**Scenarios:**

#### Scenario: UserCreate schema exists
- **WHEN** inspecting `modules/usuarios/schemas.py`
- **THEN** it SHALL define `UserCreate(BaseModel)` with required input fields for user creation

#### Scenario: UserUpdate schema has all-optional fields
- **WHEN** inspecting `modules/usuarios/schemas.py`
- **THEN** `UserUpdate` SHALL have all fields typed as `Optional[...]` for partial updates

#### Scenario: UserRead schema includes id and timestamps
- **WHEN** inspecting `modules/usuarios/schemas.py`
- **THEN** `UserRead` SHALL include `id`, `created_at`, and `updated_at` fields

#### Scenario: EntityList wraps items in paginated response
- **WHEN** inspecting any module's `schemas.py`
- **THEN** a `*List` schema SHALL exist with `items: list[...]`, `total: int`, `page: int`, `size: int`

### Requirement: Repository layer pattern

Every module SHALL have a repository class inheriting from a `BaseRepository[ModelT]` generic base class providing standard CRUD methods (`get`, `get_all`, `create`, `update`, `delete`, `paginate`).

**Scenarios:**

#### Scenario: BaseRepository provides standard CRUD
- **WHEN** inspecting `core/repository.py`
- **THEN** `BaseRepository` SHALL be a generic abstract class with `ModelT` bound to SQLAlchemy `Base`

#### Scenario: Module repository inherits base
- **WHEN** inspecting any module's `repository.py`
- **THEN** it SHALL define a class inheriting `BaseRepository[EntityModel]`

#### Scenario: Custom query methods live in module repository
- **WHEN** a module needs non-standard queries (e.g., filtering, search)
- **THEN** those methods SHALL be defined on the module's repository class, not the base

### Requirement: Service layer pattern

Every module SHALL have a service class orchestrating business logic, accepting repositories via dependency injection.

**Scenarios:**

#### Scenario: Service uses repository via DI
- **WHEN** inspecting any module's `service.py`
- **THEN** the service class constructor SHALL accept the module's repository as a parameter

#### Scenario: Router calls service, not repository
- **WHEN** inspecting any module's `router.py`
- **THEN** route handlers SHALL call service methods, never repository methods directly

### Requirement: Router registration

Every module SHALL export a configured `APIRouter` from its `__init__.py`. The main application SHALL explicitly import and include each module's router with consistent prefixing.

**Scenarios:**

#### Scenario: Module exports router from __init__.py
- **WHEN** inspecting any module's `__init__.py`
- **THEN** it SHALL export `router` as a member

#### Scenario: main.py imports all module routers
- **WHEN** inspecting `backend/main.py`
- **THEN** all module routers SHALL be imported and included via `app.include_router()`

#### Scenario: Consistent URL prefixing
- **WHEN** a module's router is included
- **THEN** the prefix SHALL follow `/api/v1/<spanish-plural>` (e.g., `/api/v1/usuarios`)

### Requirement: Error handling pattern

The system SHALL use custom exception classes and a global exception handler for consistent JSON error responses.

**Scenarios:**

#### Scenario: NotFoundError returns 404
- **WHEN** a service raises `NotFoundError("User not found")`
- **THEN** the global handler SHALL return `{"detail": "User not found", "code": "NOT_FOUND"}` with status 404

#### Scenario: All error responses have consistent format
- **WHEN** any HTTP error is raised
- **THEN** the response SHALL include `detail` (string) and `code` (string) fields

### Requirement: Field naming convention

Table names SHALL remain in Spanish. Column/field names in models and schemas SHALL use English. Endpoint paths SHALL use Spanish.

**Scenarios:**

#### Scenario: Table names are Spanish
- **WHEN** inspecting any model's `__tablename__`
- **THEN** it SHALL be in Spanish (e.g., `usuarios`, `productos`, `pedidos`)

#### Scenario: Column names are English
- **WHEN** inspecting any model's column definitions
- **THEN** field/attribute names SHALL be in English (e.g., `email`, `is_active`, `full_name`)

#### Scenario: Endpoint paths are Spanish
- **WHEN** inspecting router prefixes
- **THEN** the URL path segment SHALL be Spanish (e.g., `/api/v1/usuarios`, `/api/v1/productos`)

### Requirement: Module structure standard

Every module SHALL follow the standard file layout: `model.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`, `__init__.py`.

**Scenarios:**

#### Scenario: Standard files exist
- **WHEN** inspecting any module directory
- **THEN** all five files plus `__init__.py` SHALL exist

#### Scenario: auth module has no model.py
- **WHEN** inspecting `modules/auth/`
- **THEN** `model.py` SHALL NOT exist (auth uses User model from usuarios)
