# Spec: admin-panel (delta)

## MODIFIED Requirements

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

## ADDED Requirements

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
