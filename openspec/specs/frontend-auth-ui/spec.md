# frontend-auth-ui Specification

## Purpose
TBD - created by archiving change auth-frontend. Update Purpose after archive.
## Requirements
### Requirement: Login form with validation

The frontend SHALL provide a login form component with email/password fields, client-side validation, and error display.

#### Scenario: Login form renders with all fields
- **WHEN** the `LoginForm` component is rendered
- **THEN** the form SHALL display email input, password input, and a submit button labeled "Iniciar Sesión" or equivalent
- **AND** the form SHALL include a link to register and a link to forgot-password

#### Scenario: Login form validates empty fields
- **WHEN** the user clicks submit with empty email or password
- **THEN** the form SHALL display inline validation errors
- **AND** the form SHALL NOT call the login API

#### Scenario: Login form shows loading state
- **WHEN** the login API call is in progress
- **THEN** the submit button SHALL be disabled and show a loading indicator
- **AND** the email and password fields SHALL be disabled

#### Scenario: Login form displays API error
- **WHEN** the login API returns an error (wrong credentials)
- **THEN** the form SHALL display an error banner with the error message
- **AND** the password field SHALL be cleared

#### Scenario: Login form validates email format
- **WHEN** the user enters an invalid email format
- **THEN** the form SHALL display "Ingrese un email válido" or equivalent validation message
- **AND** the form SHALL NOT submit

### Requirement: Registration form with password strength validation

The frontend SHALL provide a registration form component with all required fields and client-side password strength validation.

#### Scenario: Registration form renders with all fields
- **WHEN** the `RegisterForm` component is rendered
- **THEN** the form SHALL display fields for email, username, first name, last name, phone (optional), password, and confirm password
- **AND** the form SHALL include a submit button labeled "Crear Cuenta" or equivalent
- **AND** the form SHALL include a link to login

#### Scenario: Registration validates password strength
- **WHEN** the user enters a password shorter than 8 characters
- **THEN** the form SHALL display "La contraseña debe tener al menos 8 caracteres"
- **WHEN** the user enters a password without uppercase letters
- **THEN** the form SHALL display "La contraseña debe contener al menos una mayúscula"
- **WHEN** the user enters a password without lowercase letters
- **THEN** the form SHALL display "La contraseña debe contener al menos una minúscula"
- **WHEN** the user enters a password without digits
- **THEN** the form SHALL display "La contraseña debe contener al menos un número"

#### Scenario: Registration validates confirm password
- **WHEN** the confirm password does not match the password
- **THEN** the form SHALL display "Las contraseñas no coinciden"

#### Scenario: Registration shows loading state
- **WHEN** the registration API call is in progress
- **THEN** the submit button SHALL be disabled and show a loading indicator
- **AND** all form fields SHALL be disabled

#### Scenario: Registration displays API error
- **WHEN** the registration API returns a validation error (e.g., duplicate email)
- **THEN** the form SHALL display the error message in an error banner
- **AND** the form SHALL remain filled with the user's input

#### Scenario: Registration success redirects to login
- **WHEN** the registration API returns success
- **THEN** the user SHALL be redirected to `/login?email=<registered_email>`
- **AND** a success message SHALL indicate their account was created

### Requirement: Forgot password form

The frontend SHALL provide a forgot password form where users can request a password reset email.

#### Scenario: Forgot password form renders
- **WHEN** the user navigates to `/forgot-password`
- **THEN** a form SHALL display with an email input and a "Enviar Enlace" or equivalent submit button
- **AND** a "Volver al Login" link SHALL be displayed

#### Scenario: Forgot password with registered email
- **WHEN** the user submits a valid email and the API returns success
- **THEN** the form SHALL display a success message: "Si el email existe, recibirás un enlace de recuperación"
- **AND** the submit button SHALL be disabled to prevent repeated submissions

#### Scenario: Forgot password validates email
- **WHEN** the user submits with an invalid email format
- **THEN** the form SHALL display an inline email validation error

### Requirement: Reset password form

The frontend SHALL provide a reset password form where users can set a new password using a token from the reset link.

#### Scenario: Reset password form renders
- **WHEN** the user navigates to `/reset-password?token=<token>`
- **THEN** the form SHALL display new password, confirm password fields, and a "Restablecer Contraseña" or equivalent submit button
- **WHEN** the user navigates to `/reset-password` without a token
- **THEN** the page SHALL display an error message indicating the reset link is invalid

#### Scenario: Reset password validates passwords
- **WHEN** the user submits with password shorter than 8 characters or missing uppercase/lowercase/digit
- **THEN** the form SHALL display the same password strength validation as registration
- **WHEN** the confirm password does not match
- **THEN** the form SHALL display "Las contraseñas no coinciden"

#### Scenario: Reset password success
- **WHEN** the reset password API returns success
- **THEN** the form SHALL display a success message: "Contraseña restablecida exitosamente"
- **AND** a link to login SHALL be displayed: "Iniciar Sesión"

#### Scenario: Reset password with invalid token
- **WHEN** the API returns an error for invalid/expired token
- **THEN** the form SHALL display an error message: "El enlace de recuperación es inválido o expiró"

### Requirement: Email verification page

The frontend SHALL provide an email verification page that processes the verification token from the URL.

#### Scenario: Verify email with valid token
- **WHEN** the user navigates to `/verify-email?token=<token>` and the API returns success
- **THEN** the page SHALL display a success message: "Email verificado exitosamente"
- **AND** a link to login SHALL be displayed

#### Scenario: Verify email with invalid token
- **WHEN** the user navigates to `/verify-email?token=<token>` and the API returns an error
- **THEN** the page SHALL display an error message: "El enlace de verificación es inválido o expiró"
- **AND** a "Reenviar Verificación" button SHALL navigate to a resend flow

#### Scenario: Verify email without token
- **WHEN** the user navigates to `/verify-email` without a token parameter
- **THEN** the page SHALL display a form to request a new verification email

### Requirement: Change password form

The frontend SHALL provide a change password form for authenticated users to update their password.

#### Scenario: Change password form renders
- **WHEN** the authenticated user views the change password form
- **THEN** the form SHALL display current password, new password, confirm password fields, and a "Cambiar Contraseña" or equivalent submit button

#### Scenario: Change password validates fields
- **WHEN** the user submits with empty current password
- **THEN** the form SHALL display "La contraseña actual es requerida"
- **WHEN** the new password fails strength validation
- **THEN** the form SHALL display the same password requirements as registration
- **WHEN** confirm password does not match new password
- **THEN** the form SHALL display "Las contraseñas no coinciden"

#### Scenario: Change password success
- **WHEN** the API returns success
- **THEN** the form SHALL display a success message: "Contraseña cambiada exitosamente"
- **AND** all form fields SHALL be cleared

#### Scenario: Change password with wrong current password
- **WHEN** the API returns 401 (wrong current password)
- **THEN** the form SHALL display "La contraseña actual es incorrecta"
- **AND** the current password field SHALL be cleared

### Requirement: Profile page display

The frontend SHALL provide a profile page for authenticated users to view their account information.

#### Scenario: Profile page shows user information
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the page SHALL display the user's first name, last name, email, username, role, and email verification status
- **AND** if the email is not verified, a "Verificar Email" link SHALL be shown

#### Scenario: Profile page includes change password
- **WHEN** the user views the profile page
- **THEN** the page SHALL include the ChangePasswordForm component
- **AND** the page SHALL include a link to view order history

### Requirement: Form validation helpers

The frontend SHALL provide reusable validation helper functions for auth forms.

#### Scenario: Password validation helper
- **WHEN** a password is validated
- **THEN** the validator SHALL check: minimum 8 characters, at least 1 uppercase, at least 1 lowercase, at least 1 digit
- **AND** the validator SHALL return an array of error messages (empty if valid)

#### Scenario: Email validation helper
- **WHEN** an email is validated
- **THEN** the validator SHALL check for a valid email format using a regex pattern
- **AND** the validator SHALL return true/false

### Requirement: Desktop auth screens use centered modal

The system SHALL display desktop auth screens (login, register) as a centered modal at 420px max-width with backdrop-filter blur(6px) and float-up animation.

#### Scenario: Login as centered modal on desktop
- **WHEN** a user clicks "Iniciar Sesión" on desktop (768px+)
- **THEN** the system SHALL open a centered modal at 420px max-width
- **AND** the modal SHALL have `backdrop-filter: blur(6px)` on the overlay
- **AND** the modal SHALL animate in with the float-up animation
- **AND** the form SHALL contain all login fields and functionality

#### Scenario: Modal closes on backdrop click
- **WHEN** a user clicks the backdrop outside the auth modal
- **THEN** the modal SHALL close
- **AND** the user remains on the current page

### Requirement: Mobile auth screens use full-screen page

The system SHALL display auth screens as full-screen pages on mobile with the logo at the top.

#### Scenario: Mobile auth shows full-screen page
- **WHEN** a user clicks "Iniciar Sesión" on mobile (< 768px)
- **THEN** the system SHALL navigate to a full-screen auth page
- **AND** the logo SHALL be displayed at the top of the page

### Requirement: Google OAuth button

The system SHALL display a Google OAuth login button when the feature flag is enabled.

#### Scenario: Google OAuth button displayed
- **WHEN** the Google OAuth feature flag is enabled
- **THEN** the login form SHALL display a "Continuar con Google" button above the email field
- **WHEN** the feature flag is disabled
- **THEN** the button SHALL NOT be displayed

### Requirement: Password strength bar

The system SHALL display a password strength bar with 4 segments that fill as password length grows.

#### Scenario: Password strength bar updates
- **WHEN** a user types in the password field on the registration form
- **THEN** a 4-segment strength bar SHALL be displayed below the password field
- **AND** segment 1 fills at 4+ chars (red)
- **AND** segment 2 fills at 8+ chars (orange)
- **AND** segment 3 fills at 12+ chars (yellow)
- **AND** segment 4 fills with uppercase + digit + special (green)

### Requirement: Password show/hide toggle

The system SHALL provide a show/hide toggle for password fields.

#### Scenario: Password visibility toggle
- **WHEN** a user views a password input field
- **THEN** an eye icon toggle SHALL be displayed inside or next to the input
- **AND** clicking the toggle SHALL alternate between showing and hiding the password text

### Requirement: "Olvidaste tu contraseña?" link in login form

The login form SHALL include a "Olvidaste tu contraseña?" link.

#### Scenario: Forgot password link in login
- **WHEN** a user views the login form
- **THEN** a "Olvidaste tu contraseña?" link SHALL be displayed below the password field
- **AND** clicking it SHALL open the forgot password form
- **AND** on desktop modal, the forgot password form SHALL replace the login form content within the modal

### Requirement: Login redirect — desktop shows modal on any page

On desktop, clicking "Iniciar Sesión" from any page SHALL show the login modal inline without page navigation.

#### Scenario: Login modal on any page
- **WHEN** a user clicks "Iniciar Sesión" from any page on desktop
- **THEN** the login modal SHALL open on the current page
- **AND** no page navigation SHALL occur
- **AND** after successful login, the modal SHALL close and the user remains on the same page

### Requirement: Auth pages SHALL use responsive layout

**Old:** (none — new requirement)

**New:** The system SHALL display auth pages (login, register, forgot password) as a centered modal at 420px with backdrop blur on desktop and as a full-screen page on mobile.

#### Scenario: Desktop shows centered modal
- **WHEN** the user opens login or register on desktop (768px+)
- **THEN** a centered modal SHALL display at 420px with backdrop blur

#### Scenario: Mobile shows full-screen page
- **WHEN** the user opens login or register on mobile (< 768px)
- **THEN** a full-screen layout SHALL display without backdrop

### Requirement: Auth forms SHALL include password features

**Old:** (none — new requirement)

**New:** The system SHALL display a 4-segment password strength bar that updates in real-time on the register form, and a show/hide toggle on all password fields.

#### Scenario: Password strength bar displays
- **WHEN** the user types a password in register form
- **THEN** a 4-segment strength bar SHALL update in real-time

#### Scenario: Password visibility toggles
- **WHEN** the user clicks the show/hide toggle
- **THEN** the password field SHALL toggle between text and password input type

### Requirement: Auth SHALL include Google OAuth

**Old:** (none — new requirement)

**New:** The system SHALL display a Google OAuth button as an alternative authentication method on both login and register pages.

#### Scenario: Google login button appears
- **WHEN** the user views login or register page
- **THEN** a Google OAuth button SHALL display as alternative authentication

