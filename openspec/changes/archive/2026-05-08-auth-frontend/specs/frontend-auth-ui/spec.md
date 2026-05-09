# frontend-auth-ui Specification (Delta)

## Overview
Frontend authentication UI components and pages for the FoodStore — login, registration, password reset, email verification, change password, and profile display.

## ADDED Requirements

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
