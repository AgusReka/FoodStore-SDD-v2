# Backend Security Specification

## ADDED Requirements

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