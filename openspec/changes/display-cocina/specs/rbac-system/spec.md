## MODIFIED Requirements

### Requirement: Default Role Definitions

The system SHALL define default roles with pre-configured permission sets.

#### Scenario: Admin role permissions
- **WHEN** checking the `admin` role
- **THEN** it SHALL have ALL permissions (product, category, user, order, payment, ingredient, kitchen)

#### Scenario: Cocina role permissions
- **WHEN** checking the `cocina` role
- **THEN** it SHALL have `kitchen:view`, `kitchen:update_status`, `product:list`, `product:read`, `ingredient:list`, `ingredient:read`

#### Scenario: Pedidos role permissions
- **WHEN** checking a `pedidos` role
- **THEN** it SHALL have `order:list_all`, `order:read_any`, `order:update_status`

#### Scenario: Cliente role permissions
- **WHEN** checking a `cliente` role
- **THEN** it SHALL have NO administrative permissions (can only access own resources via ownership checks)

### Requirement: require_role FastAPI Dependency

The system SHALL provide a `require_role(*roles: UserRole)` FastAPI dependency that validates the authenticated user has one of the required roles.

#### Scenario: User with allowed role
- **WHEN** a user with role `cocina` accesses an endpoint protected by `require_role(UserRole.COCINA, UserRole.ADMIN)`
- **THEN** the request SHALL proceed

#### Scenario: User with disallowed role
- **WHEN** a user with role `cliente` accesses an endpoint protected by `require_role(UserRole.COCINA, UserRole.ADMIN)`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Admin bypass
- **WHEN** an admin user accesses an endpoint protected by `require_role(UserRole.COCINA)`
- **THEN** the request SHALL proceed (admin bypasses all role checks)

### Requirement: Permission Constants Registry

The system SHALL define a centralized registry of granular permission constants following the `resource:action` pattern.

#### Scenario: Permission for kitchen operations
- **WHEN** a permission is needed for kitchen display operations
- **THEN** the system SHALL provide `kitchen:view`, `kitchen:update_status` constants

#### Scenario: Permission for ingredient read
- **WHEN** a permission is needed for reading ingredients
- **THEN** the system SHALL provide `ingredient:list`, `ingredient:read` constants
