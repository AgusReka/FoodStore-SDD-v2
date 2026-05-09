# frontend-api-client Specification (Delta)

## ADDED Requirements

### Requirement: Auth endpoint constants for password reset

The frontend SHALL define endpoint constants for password reset and email verification flows.

#### Scenario: Password reset endpoint constants available
- **WHEN** a developer imports from `shared/api/endpoints`
- **THEN** the following endpoint constants SHALL be available:
  - `AUTH_FORGOT_PASSWORD` resolving to `/auth/forgot-password`
  - `AUTH_RESET_PASSWORD` resolving to `/auth/reset-password`

#### Scenario: Email verification endpoint constants available
- **WHEN** a developer imports from `shared/api/endpoints`
- **THEN** the following endpoint constants SHALL be available:
  - `AUTH_SEND_VERIFICATION` resolving to `/auth/send-verification`
  - `AUTH_VERIFY_EMAIL` resolving to `/auth/verify-email`

#### Scenario: Change password endpoint constant available
- **WHEN** a developer imports from `shared/api/endpoints`
- **THEN** the following endpoint constant SHALL be available:
  - `AUTH_CHANGE_PASSWORD` resolving to `/auth/change-password`
