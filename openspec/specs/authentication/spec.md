# authentication Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: User registration

The system SHALL support new user registration with full name, email, and password.

**Scenarios:**

#### Scenario: Register with valid data
- **WHEN** a POST request is sent to `/api/v1/auth/register` with `full_name`, `email`, and `password`
- **THEN** a new user SHALL be created with role `cliente`
- **AND** the system SHALL return `UserRead` with status 201
- **AND** an access token SHALL NOT be returned (login separately)

#### Scenario: Register with existing email
- **WHEN** a POST request is sent with an email already in use
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: User login

The system SHALL support login with email and password, returning access and refresh tokens.

**Scenarios:**

#### Scenario: Login with valid credentials
- **WHEN** a POST request is sent to `/api/v1/auth/login` with valid `email` and `password`
- **THEN** the system SHALL return `{"access_token": "...", "refresh_token": "...", "token_type": "bearer"}`

#### Scenario: Login with invalid password
- **WHEN** a POST request is sent with a wrong password
- **THEN** the system SHALL return a 401 Unauthorized error

### Requirement: Get current user profile

The system SHALL return the authenticated user's profile from their access token.

**Scenarios:**

#### Scenario: Get profile with valid token
- **WHEN** a GET request is sent to `/api/v1/auth/me` with a valid `Authorization: Bearer <token>` header
- **THEN** the system SHALL return the current user's `UserRead` profile

#### Scenario: Get profile without token
- **WHEN** a GET request is sent to `/api/v1/auth/me` without an auth header
- **THEN** the system SHALL return a 401 Unauthorized error

### Requirement: User logout

The system SHALL support logout by revoking the refresh token.

**Scenarios:**

#### Scenario: Logout with valid refresh token
- **WHEN** a POST request is sent to `/api/v1/auth/logout` with a valid refresh token in the body
- **THEN** the refresh token SHALL be revoked and status 200 returned

