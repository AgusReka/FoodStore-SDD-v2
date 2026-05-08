# admin-panel Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Admin authorization

All admin endpoints SHALL require the authenticated user to have role `admin`. Non-admin requests SHALL be rejected.

**Scenarios:**

#### Scenario: Admin access granted
- **WHEN** a request is sent to any admin endpoint with a valid admin user's token
- **THEN** the request SHALL be processed normally

#### Scenario: Non-admin access denied
- **WHEN** a request is sent to any admin endpoint with a `cliente` user's token
- **THEN** the system SHALL return a 403 Forbidden error

### Requirement: List all users

The system SHALL support admin listing of all users with pagination and filtering.

**Scenarios:**

#### Scenario: Admin lists all users
- **WHEN** a GET request is sent to `/api/v1/admin/usuarios`
- **THEN** a paginated list of ALL users (not just the requester's) SHALL be returned

### Requirement: Update user role

The system SHALL allow admins to change a user's role.

**Scenarios:**

#### Scenario: Promote user to admin
- **WHEN** a PATCH request is sent to `/api/v1/admin/usuarios/{id}/role` with `role: "admin"`
- **THEN** the user's role SHALL be updated to `admin`

#### Scenario: Demote admin to cliente
- **WHEN** a PATCH request is sent to `/api/v1/admin/usuarios/{id}/role` with `role: "cliente"`
- **THEN** the user's role SHALL be updated to `cliente`

### Requirement: View all orders

The system SHALL allow admins to view all orders across all users.

**Scenarios:**

#### Scenario: Admin views all orders
- **WHEN** a GET request is sent to `/api/v1/admin/pedidos`
- **THEN** orders from ALL users SHALL be returned with pagination

