# admin-panel Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Admin authorization

The original requirement from base spec:
> All admin endpoints SHALL require the authenticated user to have role `admin`. Non-admin requests SHALL be rejected.

**Updated requirement:**
All admin endpoints SHALL use the centralized `require_permission()` dependency instead of ad-hoc role checks. Each admin endpoint SHALL require the appropriate granular permission (not just `role == admin`).

#### Scenario: Admin access granted via permission
- **WHEN** a user with `user:list` permission accesses `/api/v1/admin/usuarios`
- **THEN** the request SHALL be processed normally

#### Scenario: Access without required permission
- **WHEN** a manager (who has `product:*` but not `user:*` permissions) accesses `/api/v1/admin/usuarios`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Non-admin role with explicit permission
- **WHEN** a user with `order:list_all` permission (via a `support` role) accesses `/api/v1/admin/pedidos`
- **THEN** the request SHALL be processed

---

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

### Requirement: Admin endpoint permission mapping

The following admin endpoints SHALL require these specific permissions:

#### Scenario: List users permission
- **WHEN** accessing `GET /api/v1/admin/usuarios`
- **THEN** permission `user:list` SHALL be required

#### Scenario: Change user role permission
- **WHEN** accessing `PATCH /api/v1/admin/usuarios/{id}/role`
- **THEN** permission `user:change_role` SHALL be required

#### Scenario: List all orders permission
- **WHEN** accessing `GET /api/v1/admin/pedidos`
- **THEN** permission `order:list_all` SHALL be required

