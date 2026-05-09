# Spec: backend-security (delta)

## ADDED Requirements

### Requirement: Protected Endpoints Authorization

All endpoints that modify or access sensitive data SHALL require appropriate permissions via the centralized `require_permission()` dependency.

#### Scenario: Products endpoints protected
- **WHEN** accessing `POST /api/v1/productos`, `PUT /api/v1/productos/{id}`, or `DELETE /api/v1/productos/{id}`
- **THEN** the appropriate `product:create`, `product:update`, or `product:delete` permission SHALL be required

#### Scenario: Categories endpoints protected
- **WHEN** accessing `POST /api/v1/categorias`, `PUT /api/v1/categorias/{id}`, or `DELETE /api/v1/categorias/{id}`
- **THEN** the appropriate `category:create`, `category:update`, or `category:delete` permission SHALL be required

#### Scenario: Users endpoints protected
- **WHEN** accessing `GET /api/v1/usuarios`, `POST /api/v1/usuarios`, `PUT /api/v1/usuarios/{id}`, or `DELETE /api/v1/usuarios/{id}`
- **THEN** the appropriate `user:list`, `user:create`, `user:update`, or `user:delete` permission SHALL be required

#### Scenario: Payments endpoints protected
- **WHEN** accessing `GET /api/v1/pagos`, `POST /api/v1/pagos`, or `PATCH /api/v1/pagos/{id}/status`
- **THEN** the appropriate `payment:list`, `payment:create`, or `payment:update_status` permission SHALL be required

#### Scenario: Order status update protected
- **WHEN** accessing `PATCH /api/v1/pedidos/{id}/status`
- **THEN** the `order:update_status` permission SHALL be required

---

### Requirement: Public Read-Only Endpoints

Read-only product and category listing endpoints SHALL remain publicly accessible without authentication.

#### Scenario: Public product listing
- **WHEN** an unauthenticated request accesses `GET /api/v1/productos` or `GET /api/v1/productos/{id}`
- **THEN** the request SHALL succeed (no auth required for browsing)

#### Scenario: Public category listing
- **WHEN** an unauthenticated request accesses `GET /api/v1/categorias` or `GET /api/v1/categorias/{id}`
- **THEN** the request SHALL succeed (no auth required for browsing)

---

### Requirement: Ownership-Based Authorization

Users SHALL be able to access and modify their own resources without global permissions.

#### Scenario: User accesses own orders
- **WHEN** a `cliente` user accesses `GET /api/v1/pedidos` (their own orders)
- **THEN** the request SHALL succeed (ownership check, not global permission)

#### Scenario: User accesses own order
- **WHEN** a `cliente` user accesses `GET /api/v1/pedidos/{id}` for an order they own
- **THEN** the request SHALL succeed

#### Scenario: User accesses own addresses
- **WHEN** a `cliente` user accesses `GET /api/v1/direcciones` or `POST /api/v1/direcciones`
- **THEN** the request SHALL succeed (scoped by `current_user["user_id"]`)
