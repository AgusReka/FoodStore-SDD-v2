# frontend-state-management Specification (Delta)

## ADDED Requirements

### Requirement: Auth store registration action

The authStore SHALL support user registration by calling the register API.

#### Scenario: Register action called
- **WHEN** `authStore.register(data)` is called with valid registration data
- **THEN** a POST request SHALL be sent to `ENDPOINTS.AUTH_REGISTER`
- **AND** on success, tokens SHALL NOT be stored (user must login separately)
- **AND** `isLoading` SHALL be `false`
- **AND** `hasError` SHALL be `false`

#### Scenario: Register action error
- **WHEN** `authStore.register(data)` fails
- **THEN** `isLoading` SHALL be `false`
- **AND** `hasError` SHALL be `true`

### Requirement: Auth store forgot password action

The authStore SHALL support forgot password requests.

#### Scenario: Forgot password action called
- **WHEN** `authStore.forgotPassword(email)` is called
- **THEN** a POST request SHALL be sent to `ENDPOINTS.AUTH_FORGOT_PASSWORD`
- **AND** `isLoading` SHALL be managed through the action lifecycle

#### Scenario: Forgot password with unregistered email
- **WHEN** the API returns the same success message for unregistered emails
- **THEN** `hasError` SHALL remain `false` (to prevent email enumeration)

### Requirement: Auth store reset password action

The authStore SHALL support password reset with a token.

#### Scenario: Reset password action called
- **WHEN** `authStore.resetPassword(token, newPassword, confirmPassword)` is called
- **THEN** a POST request SHALL be sent to `ENDPOINTS.AUTH_RESET_PASSWORD`
- **AND** on success, `isLoading` SHALL be `false`

#### Scenario: Reset password with invalid token
- **WHEN** the API returns a 400 error for invalid/expired token
- **THEN** `hasError` SHALL be `true`

### Requirement: Auth store send verification action

The authStore SHALL support sending verification emails.

#### Scenario: Send verification action called
- **WHEN** `authStore.sendVerification(email)` is called
- **THEN** a POST request SHALL be sent to `ENDPOINTS.AUTH_SEND_VERIFICATION`

### Requirement: Auth store verify email action

The authStore SHALL support email verification via token.

#### Scenario: Verify email action called
- **WHEN** `authStore.verifyEmail(token)` is called
- **THEN** a POST request SHALL be sent to `ENDPOINTS.AUTH_VERIFY_EMAIL`
- **AND** on success, the user's `is_verified` SHALL be updated in the store if user data is present

### Requirement: Auth store change password action

The authStore SHALL support password changes for authenticated users.

#### Scenario: Change password action called
- **WHEN** `authStore.changePassword(currentPassword, newPassword, confirmPassword)` is called
- **THEN** a PUT request SHALL be sent to `ENDPOINTS.AUTH_CHANGE_PASSWORD`
- **AND** on success, `isLoading` SHALL be `false`

### Requirement: useAuth hook provides forgot password mutation

The useAuth hook SHALL provide a TanStack Query mutation for forgot password.

#### Scenario: Forgot password mutation available
- **WHEN** `useAuth().forgotPassword` is destructured
- **THEN** it SHALL provide `mutateAsync(email)` that calls `POST /auth/forgot-password`
- **AND** it SHALL return `isPending` and `error` states

### Requirement: useAuth hook provides reset password mutation

The useAuth hook SHALL provide a TanStack Query mutation for reset password.

#### Scenario: Reset password mutation available
- **WHEN** `useAuth().resetPassword` is destructured
- **THEN** it SHALL provide `mutateAsync({ token, newPassword, confirmPassword })` that calls `POST /auth/reset-password`
- **AND** it SHALL return `isPending` and `error` states

### Requirement: useAuth hook provides send verification mutation

The useAuth hook SHALL provide a TanStack Query mutation for sending verification emails.

#### Scenario: Send verification mutation available
- **WHEN** `useAuth().sendVerification` is destructured
- **THEN** it SHALL provide `mutateAsync(email)` that calls `POST /auth/send-verification`
- **AND** it SHALL return `isPending` and `error` states

### Requirement: useAuth hook provides verify email mutation

The useAuth hook SHALL provide a TanStack Query mutation for email verification.

#### Scenario: Verify email mutation available
- **WHEN** `useAuth().verifyEmail` is destructured
- **THEN** it SHALL provide `mutateAsync(token)` that calls `POST /auth/verify-email`
- **AND** it SHALL return `isPending` and `error` states

### Requirement: useAuth hook provides change password mutation

The useAuth hook SHALL provide a TanStack Query mutation for changing passwords.

#### Scenario: Change password mutation available
- **WHEN** `useAuth().changePassword` is destructured
- **THEN** it SHALL provide `mutateAsync({ currentPassword, newPassword, confirmPassword })` that calls `PUT /auth/change-password`
- **AND** it SHALL return `isPending` and `error` states
