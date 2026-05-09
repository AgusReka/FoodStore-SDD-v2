# frontend-api-client Specification

## Purpose
API client layer for the FoodStore frontend — Axios instance, interceptors, endpoint constants, and typed helpers.
## Requirements
### Requirement: Axios instance configured with base URL

The frontend SHALL have a configured Axios instance with base URL from environment variables.

#### Scenario: Axios instance created
- **WHEN** the developer imports the API client from `shared/api/`
- **THEN** it SHALL return a pre-configured Axios instance
- **AND** the `baseURL` SHALL be set to `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:8000` if not set) with prefix `/api/v1`

#### Scenario: JSON headers set by default
- **WHEN** the Axios instance makes a request
- **THEN** the `Content-Type` header SHALL be set to `application/json`
- **AND** the `Accept` header SHALL be set to `application/json`

### Requirement: Request interceptor for authentication

The Axios request interceptor SHALL read the access token from the Zustand `authStore` and inject it into the Authorization header.

#### Scenario: Request interceptor uses authStore
- **WHEN** a request is made
- **THEN** the interceptor SHALL dynamically import `authStore.getState().accessToken` to obtain the current access token
- **AND** if a token exists, the interceptor SHALL set the `Authorization: Bearer <token>` header
- **AND** the interceptor SHALL NOT read from `localStorage` directly

### Requirement: Response interceptor with token refresh

The Axios response interceptor SHALL attempt token refresh when a 401 response is received, using a retry queue to prevent concurrent refresh calls.

#### Scenario: Token refresh on 401
- **WHEN** the API returns a 401 Unauthorized response
- **THEN** the interceptor SHALL attempt to refresh the token by calling `POST /api/v1/auth/refresh` with the stored refresh token
- **AND** the interceptor SHALL use a retry queue to handle concurrent 401s: only one refresh request at a time, queue other failed requests
- **AND** if the refresh succeeds, the interceptor SHALL retry all queued requests with the new access token
- **AND** if the refresh fails, the interceptor SHALL call `authStore.clearAuth()` and redirect to login

#### Scenario: Retry queue prevents duplicate refresh calls
- **WHEN** multiple requests fail with 401 simultaneously
- **THEN** only one refresh request SHALL be sent
- **AND** subsequent 401s SHALL be queued
- **AND** once the refresh completes, all queued requests SHALL be retried (on success) or rejected (on failure)

#### Scenario: Network errors handled
- **WHEN** a network error occurs (no response from server)
- **THEN** the interceptor SHALL log the error and re-throw it

### Requirement: Endpoint constants defined

The frontend SHALL define all API endpoint paths as constants in `shared/api/endpoints.ts`.

#### Scenario: All endpoints defined as constants
- **WHEN** a developer imports from `shared/api/endpoints`
- **THEN** endpoint constants SHALL be available for all modules: auth, users, products, categories, orders, payments, addresses, admin, and health

### Requirement: Typed API client helpers

The frontend SHALL define typed API helper functions in `shared/api/client.ts` using the Axios instance.

#### Scenario: API helpers available
- **WHEN** a developer imports from `shared/api/client`
- **THEN** helper functions SHALL be available for common API patterns (get, post, patch, delete) that:
  - Accept a relative URL path
  - Accept optional parameters and body data
  - Return typed responses
  - Use the pre-configured Axios instance from `shared/api/axios`

### Requirement: API barrel export

The `shared/api/index.ts` file SHALL re-export all API modules.

#### Scenario: All API modules exported
- **WHEN** a file imports from `@shared/api` or `shared/api`
- **THEN** `apiClient`, `endpoints`, `queryKeys`, and typed client helpers SHALL be available

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

