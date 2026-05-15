## MODIFIED Requirements

### Requirement: Get current user profile

The system SHALL return the authenticated user's profile from their access token.

**Scenarios:**

#### Scenario: Get profile with valid token
- **WHEN** a GET request is sent to `/api/v1/auth/me` with a valid `Authorization: Bearer <token>` header
- **THEN** the system SHALL return the current user's `UserRead` profile

#### Scenario: Get profile without token
- **WHEN** a GET request is sent to `/api/v1/auth/me` without an auth header
- **THEN** the system SHALL return a 401 Unauthorized error

#### Scenario: Get profile with valid token but deleted user
- **WHEN** a GET request is sent to `/api/v1/auth/me` with a valid JWT whose `sub` user no longer exists in the database
- **THEN** the system SHALL return a 401 Unauthorized error
- **AND** the system SHALL NOT return 404

## ADDED Requirements

### Requirement: Frontend stale token auto-recovery

The frontend SHALL automatically recover from stale/invalid authentication tokens by clearing auth state and redirecting to login when profile fetch fails for any reason.

#### Scenario: ProtectedRoute clears stale token on profile fetch failure
- **WHEN** the frontend loads with a persisted `accessToken` that is invalid or whose user no longer exists
- **AND** `fetchProfile()` receives any error response (4xx or 5xx or network error)
- **THEN** the authStore SHALL clear `accessToken`, `refreshToken`, and `user`
- **AND** the user SHALL be redirected to `/login`

#### Scenario: ProtectedRoute does not infinitely retry failed profile fetch
- **WHEN** `fetchProfile()` fails
- **THEN** ProtectedRoute SHALL NOT re-trigger `fetchProfile()` on subsequent renders
- **AND** the user SHALL see the login page (not an infinite spinner)

#### Scenario: LoginPage does not redirect with stale token
- **WHEN** the user navigates to `/login` while `accessToken` exists but `user` is null
- **THEN** the LoginPage SHALL NOT redirect to home
- **AND** the user SHALL be able to log in again
