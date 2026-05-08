## MODIFIED Requirements

### Requirement: Request interceptor for authentication

**Updated:** The Axios request interceptor SHALL read the access token from the Zustand `authStore` instead of from `localStorage` directly.

#### Scenario: Request interceptor uses authStore
- **WHEN** a request is made
- **THEN** the interceptor SHALL call `authStore.getState().accessToken` to obtain the current access token
- **AND** if a token exists, the interceptor SHALL set the `Authorization: Bearer <token>` header
- **AND** the interceptor SHALL NOT read from `localStorage` directly

## ADDED Requirements

### Requirement: Response interceptor with token refresh

The Axios response interceptor SHALL attempt token refresh when a 401 response is received.

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

### Requirement: Endpoint constants defined

The frontend SHALL define all API endpoint paths as constants in `shared/api/endpoints.ts`.

#### Scenario: All endpoints defined as constants
- **WHEN** a developer imports from `shared/api/endpoints`
- **THEN** the following endpoint constants SHALL be available:
  - `AUTH_REGISTER`, `AUTH_LOGIN`, `AUTH_ME`, `AUTH_REFRESH`, `AUTH_LOGOUT`
  - `USERS_LIST`, `USERS_DETAIL`
  - `PRODUCTS_LIST`, `PRODUCTS_DETAIL`
  - `CATEGORIES_LIST`, `CATEGORIES_DETAIL`
  - `ORDERS_LIST`, `ORDERS_DETAIL`, `ORDERS_CREATE`, `ORDERS_UPDATE_STATUS`
  - `PAYMENTS_CREATE`, `PAYMENTS_DETAIL`
  - `ADDRESSES_LIST`, `ADDRESSES_CREATE`, `ADDRESSES_UPDATE`, `ADDRESSES_DELETE`
  - `ADMIN_USERS_LIST`, `ADMIN_USERS_ROLE`, `ADMIN_ORDERS_LIST`
  - `HEALTH`, `HEALTH_READY`, `HEALTH_LIVE`

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
