# session-management Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Create refresh token

The system SHALL create a refresh token tied to a user when they log in.

**Scenarios:**

#### Scenario: Token created on login
- **WHEN** a user logs in successfully
- **THEN** a refresh token SHALL be created and stored associated with that user

### Requirement: Refresh access token

The system SHALL support issuing a new access token using a valid refresh token.

**Scenarios:**

#### Scenario: Refresh with valid token
- **WHEN** a POST request is sent to `/api/v1/auth/refresh` with a valid refresh token
- **THEN** a new access token SHALL be returned along with a new refresh token (token rotation)

#### Scenario: Refresh with expired token
- **WHEN** a POST request is sent with an expired refresh token
- **THEN** the system SHALL return a 401 Unauthorized error

#### Scenario: Refresh with revoked token
- **WHEN** a POST request is sent with a revoked refresh token
- **THEN** the system SHALL return a 401 Unauthorized error

### Requirement: Revoke refresh token

The system SHALL support revoking a refresh token (on logout or admin action).

**Scenarios:**

#### Scenario: Revoke on logout
- **WHEN** a user logs out
- **THEN** their refresh token SHALL be marked as revoked

