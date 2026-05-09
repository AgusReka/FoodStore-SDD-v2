# Spec: rbac-system (new)

## ADDED Requirements

### Requirement: Permission Constants Registry

The system SHALL define a centralized registry of granular permission constants following the `resource:action` pattern.

#### Scenario: Permission for product operations
- **WHEN** a permission is needed for product CRUD operations
- **THEN** the system SHALL provide `product:list`, `product:read`, `product:create`, `product:update`, `product:delete` constants

#### Scenario: Permission for user operations
- **WHEN** a permission is needed for user management operations
- **THEN** the system SHALL provide `user:list`, `user:read`, `user:create`, `user:update`, `user:delete`, `user:change_role` constants

#### Scenario: Permission for order operations
- **WHEN** a permission is needed for order operations
- **THEN** the system SHALL provide `order:list_all`, `order:read_any`, `order:update_status` constants

#### Scenario: Permission for category operations
- **WHEN** a permission is needed for category CRUD
- **THEN** the system SHALL provide `category:list`, `category:read`, `category:create`, `category:update`, `category:delete` constants

#### Scenario: Permission for payment operations
- **WHEN** a permission is needed for payment operations
- **THEN** the system SHALL provide `payment:list`, `payment:read`, `payment:create`, `payment:update_status` constants

---

### Requirement: Default Role Definitions

The system SHALL define default roles with pre-configured permission sets.

#### Scenario: Admin role permissions
- **WHEN** checking the `admin` role
- **THEN** it SHALL have ALL permissions (product, category, user, order, payment)

#### Scenario: Manager role permissions
- **WHEN** checking a `manager` role
- **THEN** it SHALL have product CRUD, category CRUD, order read/update, but NOT user management permissions

#### Scenario: Cliente role permissions
- **WHEN** checking a `cliente` role
- **THEN** it SHALL have NO administrative permissions (can only access own resources via ownership checks)

---

### Requirement: Role-to-Permission Lookup

The system SHALL provide a lookup mechanism to resolve which permissions a given role has.

#### Scenario: Resolve permissions for admin
- **WHEN** `get_permissions_for_role(UserRole.ADMIN)` is called
- **THEN** it SHALL return the full list of all permission constants

#### Scenario: Resolve permissions for cliente
- **WHEN** `get_permissions_for_role(UserRole.CLIENTE)` is called
- **THEN** it SHALL return an empty list (clientes use ownership checks, not global permissions)

---

### Requirement: require_role FastAPI Dependency

The system SHALL provide a `require_role(role: UserRole)` FastAPI dependency that validates the authenticated user has a minimum required role.

#### Scenario: User with sufficient role
- **WHEN** a user with role `admin` accesses an endpoint protected by `require_role(UserRole.ADMIN)`
- **THEN** the request SHALL proceed

#### Scenario: User with insufficient role
- **WHEN** a user with role `cliente` accesses an endpoint protected by `require_role(UserRole.ADMIN)`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated request accesses an endpoint protected by `require_role()`
- **THEN** the system SHALL return a 401 Unauthorized error

---

### Requirement: require_permission FastAPI Dependency

The system SHALL provide a `require_permission(permission: str)` FastAPI dependency that validates the authenticated user has the required permission via their role.

#### Scenario: Admin has permission
- **WHEN** an `admin` user accesses an endpoint protected by `require_permission("product:create")`
- **THEN** the request SHALL proceed

#### Scenario: Manager has permission
- **WHEN** a `manager` user accesses an endpoint protected by `require_permission("product:create")`
- **THEN** the request SHALL proceed (manager has product permissions)

#### Scenario: Manager lacks permission
- **WHEN** a `manager` user accesses an endpoint protected by `require_permission("user:delete")`
- **THEN** the system SHALL return a 403 Forbidden error (managers cannot manage users)

#### Scenario: Cliente lacks global permission
- **WHEN** a `cliente` user accesses an endpoint protected by `require_permission("product:list")`
- **THEN** the system SHALL return a 403 Forbidden error

---

### Requirement: Permission Check on Endpoint Registration

The dependency SHALL resolve permissions at request time by:
1. Extracting the `role` claim from the JWT payload
2. Looking up permissions for that role
3. Checking if the required permission is in the set

#### Scenario: Role extracted from JWT
- **WHEN** a `require_permission()` dependency runs
- **THEN** it SHALL read the `role` claim from the already-decoded JWT via `get_current_user`
- **AND** it SHALL NOT make a database call for permission lookup

#### Scenario: Permission lookup is stateless
- **WHEN** checking permissions
- **THEN** the lookup SHALL use an in-memory role-to-permissions mapping (config-driven, not DB-driven for simplicity)

---

### Requirement: Frontend usePermissions Hook

The frontend SHALL provide a `usePermissions()` hook that returns the current user's permissions.

#### Scenario: Hook returns user's permissions
- **WHEN** an admin user is authenticated
- **THEN** `usePermissions().can("product:create")` SHALL return `true`

#### Scenario: Hook returns false for missing permission
- **WHEN** a cliente user is authenticated
- **THEN** `usePermissions().can("user:list")` SHALL return `false`

---

### Requirement: Frontend Can Component

The frontend SHALL provide a `<Can permission="...">` component that conditionally renders children based on permissions.

#### Scenario: Renders when permission exists
- **WHEN** `<Can permission="product:create"><button>New Product</button></Can>` is rendered by an admin
- **THEN** the button SHALL be rendered

#### Scenario: Does not render when missing permission
- **WHEN** `<Can permission="product:create"><button>New Product</button></Can>` is rendered by a cliente
- **THEN** the button SHALL NOT be rendered
