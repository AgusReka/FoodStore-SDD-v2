## Why

All frontend state management stores (auth, cart, payment, UI) are empty stubs — the application cannot manage authentication state, shopping cart contents, payment flow, or UI toasts/modals. Zustand is not installed as a dependency. The existing Axios interceptor reads tokens from `localStorage` directly instead of from a proper store, and has no token refresh logic. Without this change, every feature that depends on state (login, cart, checkout, profile) remains impossible to implement.

## What Changes

- Install `zustand` npm dependency
- Implement **authStore**: authentication state, token storage (access + refresh), user profile, login/logout/refresh actions
- Implement **cartStore**: cart items, quantities, add/remove/clear operations, total calculation
- Implement **paymentStore**: payment method selection, payment processing status, transaction state
- Implement **uiStore**: sidebar open/close, modal management, toast notifications, global loading state
- Update `stores/index.ts` with barrel export
- Implement **useAuth** hook: unified interface combining authStore + TanStack Query for `GET /api/v1/auth/me`
- Implement **useCart** hook: cart operations with API sync for `POST /api/v1/pedidos/`
- Update `api/axios.ts` interceptor to read tokens from authStore instead of localStorage
- Add token refresh logic in the 401 response interceptor using `POST /api/v1/auth/refresh`
- Implement `shared/api/endpoints.ts` with all API endpoint constants
- Implement `shared/api/client.ts` with typed API helper functions
- Implement `shared/config/constants.ts` with app-wide constants (token expiry, storage keys, etc.)
- Implement `shared/config/routes.ts` with route path constants
- Update empty index files (`api/index.ts`, `hooks/index.ts`, `stores/index.ts`)

## Capabilities

### New Capabilities
- `frontend-state-management`: Zustand-powered stores for authentication (tokens, user profile, login/logout/refresh), shopping cart (items, quantities, totals, add/remove/clear), payment (method selection, processing state), and UI (sidebar, modals, toasts, loading). Also includes typed hooks (useAuth, useCart) that bridge stores with TanStack Query for server state.

### Modified Capabilities
- `frontend-api-client`: The existing Axios request interceptor spec says "prepared for Zustand store" and "TODO: will be completed in auth-frontend change." This change actually implements the Zustand store integration — the interceptor SHALL read tokens from authStore, and the response interceptor SHALL attempt token refresh on 401 before falling back to logout.

## Impact

- **Dependencies**: `zustand` added to `frontend/package.json`
- **Files created/modified**:
  - `frontend/src/shared/stores/authStore.ts` — implement
  - `frontend/src/shared/stores/cartStore.ts` — implement
  - `frontend/src/shared/stores/paymentStore.ts` — implement
  - `frontend/src/shared/stores/uiStore.ts` — implement
  - `frontend/src/shared/stores/index.ts` — update barrel export
  - `frontend/src/shared/hooks/useAuth.ts` — implement
  - `frontend/src/shared/hooks/useCart.ts` — implement
  - `frontend/src/shared/hooks/index.ts` — update barrel export
  - `frontend/src/shared/api/axios.ts` — update interceptors for authStore + token refresh
  - `frontend/src/shared/api/endpoints.ts` — implement
  - `frontend/src/shared/api/client.ts` — implement
  - `frontend/src/shared/api/index.ts` — update barrel export
  - `frontend/src/shared/config/constants.ts` — implement
  - `frontend/src/shared/config/routes.ts` — implement
  - `frontend/package.json` — add zustand dependency
- **No backend changes**
