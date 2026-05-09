# authentication Specification (Delta)

## ADDED Requirements

### Requirement: Frontend login flow integration

The frontend login page SHALL integrate with the backend login API and handle authentication tokens.

#### Scenario: Login via LoginForm stores tokens
- **WHEN** the user submits valid credentials via `LoginForm`
- **THEN** `authStore.login()` SHALL be called with email and password
- **AND** on success, the user SHALL be redirected according to the redirect strategy
- **AND** the access token SHALL be persisted to localStorage

#### Scenario: Login error displays backend message
- **WHEN** the backend returns 401 Unauthorized
- **THEN** the LoginForm SHALL display "Email o contraseña incorrectos" or equivalent
- **AND** the password field SHALL be cleared

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
