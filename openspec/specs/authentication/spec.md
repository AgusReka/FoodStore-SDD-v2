# authentication Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: User registration

The registration flow SHALL validate passwords against strength rules before creating a user.

#### Scenario: Register with valid data
- **WHEN** a POST request is sent to `/api/v1/auth/register` with `email`, `username`, `password`, `first_name`, `last_name`
- **THEN** a new user SHALL be created with role `cliente`
- **AND** the system SHALL return `UserRead` with status 201
- **AND** an access token SHALL NOT be returned (login separately)
- **AND** password SHALL be validated against strength rules

### Requirement: User login

The access token SHALL include the user's email claim in addition to sub and role.

#### Scenario: Login with valid credentials
- **WHEN** a POST request is sent to `/api/v1/auth/login` with valid `email` and `password`
- **THEN** the system SHALL return `{"access_token": "...", "refresh_token": "...", "token_type": "bearer"}`
- **AND** the access token SHALL contain `sub` (user ID), `role`, and `email` claims

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

### Requirement: User logout

The system SHALL support logout by revoking the refresh token.

**Scenarios:**

#### Scenario: Logout with valid refresh token
- **WHEN** a POST request is sent to `/api/v1/auth/logout` with a valid refresh token in the body
- **THEN** the refresh token SHALL be revoked and status 200 returned

### Requirement: Password reset request

The system SHALL support password reset via email: a user can request a reset token, then use it to set a new password.

#### Scenario: Forgot password with registered email
- **WHEN** a POST request is sent to `/api/v1/auth/forgot-password` with a registered email
- **THEN** the system SHALL generate a password reset token
- **AND** the system SHALL return `{"message": "If the email exists, a reset link has been sent"}`
- **AND** the user SHALL receive a reset token (logged to console in development)

#### Scenario: Forgot password with unregistered email
- **WHEN** a POST request is sent to `/api/v1/auth/forgot-password` with an unregistered email
- **THEN** the system SHALL return the same success message to prevent email enumeration

#### Scenario: Reset password with valid token
- **WHEN** a POST request is sent to `/api/v1/auth/reset-password` with a valid `token`, `new_password`, and `confirm_password`
- **THEN** the user's password SHALL be updated
- **AND** the token SHALL be marked as used
- **AND** the system SHALL return `{"message": "Password has been reset successfully"}`

#### Scenario: Reset password with invalid token
- **WHEN** a POST request is sent to `/api/v1/auth/reset-password` with an invalid or expired token
- **THEN** the system SHALL return a 400 Bad Request error

#### Scenario: Reset password with mismatched confirmation
- **WHEN** a POST request is sent with `new_password` not matching `confirm_password`
- **THEN** the system SHALL return a 422 Validation Error

### Requirement: Email verification

The system SHALL support email verification to confirm user email addresses.

#### Scenario: Send verification email
- **WHEN** a POST request is sent to `/api/v1/auth/send-verification` with an email
- **THEN** the system SHALL generate an email verification token
- **AND** return `{"message": "If the email exists, a verification link has been sent"}`
- **AND** the token SHALL be logged to console in development

#### Scenario: Verify email with valid token
- **WHEN** a POST request is sent to `/api/v1/auth/verify-email` with a valid verification token
- **THEN** the user's `is_verified` SHALL be set to `True`
- **AND** the system SHALL return `{"message": "Email verified successfully"}`

#### Scenario: Verify email with invalid token
- **WHEN** a POST request is sent with an invalid or expired verification token
- **THEN** the system SHALL return a 400 Bad Request error

### Requirement: Change password

Authenticated users SHALL be able to change their password by providing their current password.

#### Scenario: Change password with correct current password
- **WHEN** a PUT request is sent to `/api/v1/auth/change-password` with a valid JWT, correct `current_password`, matching `new_password` and `confirm_password`
- **THEN** the user's password SHALL be updated
- **AND** all existing refresh tokens for the user SHALL be revoked
- **AND** the system SHALL return `{"message": "Password changed successfully"}`

#### Scenario: Change password with wrong current password
- **WHEN** a PUT request is sent with an incorrect `current_password`
- **THEN** the system SHALL return a 401 Unauthorized error

#### Scenario: Change password without authentication
- **WHEN** a PUT request is sent without a valid JWT
- **THEN** the system SHALL return a 401 Unauthorized error

### Requirement: Password validation

The system SHALL enforce password strength rules during registration, password reset, and password change.

#### Scenario: Register with weak password
- **WHEN** a POST request is sent to `/api/v1/auth/register` with a password shorter than 8 characters or without uppercase/lowercase/digit
- **THEN** the system SHALL return a 422 Validation Error with details about password requirements

#### Scenario: Register with valid strong password
- **WHEN** a POST request is sent with a password meeting all strength requirements
- **THEN** the system SHALL accept the password and create the user

### Requirement: Frontend login flow integration

The frontend login page SHALL integrate with the backend login API and handle authentication tokens.

#### Scenario: Logout clears TanStack Query cache
- **WHEN** the user clicks "Cerrar sesión"
- **THEN** `authStore.logout()` SHALL be called
- **AND** the TanStack Query client cache SHALL be cleared
- **AND** the user SHALL be redirected to `/login`
- **AND** when a new user logs in, the query cache SHALL fetch fresh data from the API (not serve stale cached data)

### Requirement: Frontend registration flow integration

The frontend registration page SHALL integrate with the backend registration API.

#### Scenario: Registration creates user account
- **WHEN** the user submits valid registration data via `RegisterForm`
- **THEN** `authStore.register()` or the `useAuth` register mutation SHALL be called
- **AND** on success, the user SHALL be redirected to `/login?email=<email>`

#### Scenario: Registration with existing email
- **WHEN** the backend returns an error for duplicate email
- **THEN** the RegisterForm SHALL display "El email ya está registrado" or equivalent
- **AND** the form SHALL NOT redirect

### Requirement: Frontend password reset flow integration

The frontend forgot password and reset password pages SHALL integrate with the backend reset flow.

#### Scenario: Forgot password requests reset token
- **WHEN** the user submits their email on the forgot password form
- **THEN** `POST /auth/forgot-password` SHALL be called with the email
- **AND** the page SHALL display "Si el email existe, recibirás un enlace de recuperación"

#### Scenario: Reset password sets new password
- **WHEN** the user submits a valid token, new password, and confirmation
- **THEN** `POST /auth/reset-password` SHALL be called
- **AND** on success, the page SHALL display a success message with a link to login

### Requirement: Frontend email verification flow integration

The frontend verify email page SHALL integrate with the backend verification flow.

#### Scenario: Verify email confirmation
- **WHEN** the user navigates with a valid verification token
- **THEN** `POST /auth/verify-email` SHALL be called with the token
- **AND** the page SHALL display a success or error message

### Requirement: Frontend change password flow integration

The frontend change password form SHALL integrate with the backend change password API for authenticated users.

#### Scenario: Change password authenticated
- **WHEN** an authenticated user submits current + new password
- **THEN** `PUT /auth/change-password` SHALL be called with the Authorization header
- **AND** on success, the form SHALL show a success message

### Requirement: get_current_user includes role

The `get_current_user` dependency SHALL include the user's role from the JWT payload in its return value.

#### Scenario: Role extracted from token
- **WHEN** `get_current_user` decodes a valid JWT
- **THEN** the returned dict SHALL include `"role": <role_value>` alongside `"user_id"` and `"email"`

#### Scenario: Missing role claim
- **WHEN** a JWT is decoded that does not contain a `role` claim
- **THEN** the system SHALL return a 401 Unauthorized error with "Invalid token structure"

---

### Requirement: Frontend registration redirects to login

The frontend SHALL redirect to the login page after successful registration, without automatically logging in.

#### Scenario: Register redirects to login
- **WHEN** the user submits valid registration data
- **THEN** `authStore.register()` or the `useAuth` register mutation SHALL be called
- **AND** on success, the user SHALL be redirected to `/login?email=<email>`
- **AND** the system SHALL NOT call `login()` or store any authentication tokens

### Requirement: ProductDetailModal auth check

The ProductDetailModal SHALL redirect unauthenticated users to the login page when they attempt to add a product to cart.

#### Scenario: Modal redirects to login
- **WHEN** an unauthenticated user clicks "Agregar" in the ProductDetailModal
- **THEN** the modal SHALL close
- **AND** the user SHALL be redirected to `/login?redirect=/productos/<product-id>`

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

