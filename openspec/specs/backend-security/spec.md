# Backend Security Specification
## Requirements
### Requirement: JWT Authentication

The backend SHALL implement JWT-based authentication for API security.

#### Scenario: Token generation
- **WHEN** user authenticates successfully
- **THEN** the backend generates a JWT access token
- **AND** the token contains user_id, email, and expiration timestamp

#### Scenario: Token validation
- **WHEN** a protected endpoint receives a request
- **THEN** the Authorization header is parsed for Bearer token
- **AND** the token signature is validated against SECRET_KEY

#### Scenario: Expired token rejection
- **WHEN** an expired token is submitted
- **THEN** the backend returns 401 Unauthorized
- **AND** the response includes "Token expired" message

### Requirement: Password Hashing

The backend SHALL securely hash passwords before storing them.

#### Scenario: Password hashing
- **WHEN** a user creates or updates a password
- **THEN** the password is hashed using bcrypt or argon2
- **AND** plain text password is never stored

#### Scenario: Password verification
- **WHEN** user attempts to authenticate
- **THEN** the provided password is verified against the stored hash
- **AND** the result is boolean (valid/invalid)

### Requirement: Protected Endpoints

The backend SHALL protect specific endpoints requiring authentication.

#### Scenario: Accessing protected resource
- **WHEN** authenticated user accesses protected route
- **THEN** the request proceeds with user context available

#### Scenario: Accessing protected resource without auth
- **WHEN** unauthenticated user accesses protected route
- **THEN** the backend returns 401 Unauthorized

### Requirement: CORS Configuration

The backend SHALL configure CORS to allow frontend communication.

#### Scenario: Development CORS
- **WHEN** running in development mode
- **THEN** CORS_ORIGINS includes http://localhost:5173

#### Scenario: Production CORS
- **WHEN** running in production
- **THEN** CORS_ORIGINS includes only the production domain
- **AND** wildcard origins are NOT allowed

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

