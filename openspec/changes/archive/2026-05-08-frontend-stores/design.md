## Context

The FoodStore frontend has 4 empty Zustand store stubs (`authStore`, `cartStore`, `paymentStore`, `uiStore`) and 2 empty hook stubs (`useAuth`, `useCart`). Zustand is not installed as a dependency. The Axios instance in `shared/api/axios.ts` reads tokens directly from `localStorage` and has a placeholder 401 handler. Several `index.ts` barrel exports and config files are also empty.

The backend API is fully implemented with 10 modules (auth, usuarios, productos, categorias, pedidos, pagos, direcciones, admin, refreshtokens, health) under `/api/v1/`. Auth uses JWT with access tokens (30min) and refresh tokens (7 days).

## Goals / Non-Goals

**Goals:**
- Install and configure Zustand as the client-side state manager
- Implement 4 Zustand stores: auth, cart, payment, UI
- Implement typed hooks that bridge stores with TanStack Query for server data
- Update the Axios interceptor to use authStore for token injection and 401 refresh
- Create endpoint constants, route constants, and typed API client helpers
- Fill all empty barrel exports (`stores/index.ts`, `api/index.ts`, `hooks/index.ts`)

**Non-Goals:**
- No backend API changes
- No UI component implementation (components reference stores but are not part of this change)
- No TanStack Query provider setup (already configured per `frontend-data-fetching` spec)
- No page routing logic (routes are defined; this change only creates route constants)

## Decisions

### Decision 1: Zustand with `persist` middleware for auth tokens

**Choice:** Use `zustand/middleware` `persist` for `authStore` only. Cart, payment, and UI stores stay in-memory.

**Rationale:** Auth tokens (access + refresh) must survive page refresh. Cart state is transient and should reset on session end. Payment state is ephemeral per transaction. UI state (modals, toasts) is session-only.

**Alternative considered:** Persisting everything to localStorage. Rejected because stale cart data causes confusion. Persisting only auth is the standard pattern.

### Decision 2: Token refresh in Axios response interceptor

**Choice:** Implement token refresh in the Axios 401 response interceptor with a retry queue to prevent multiple simultaneous refresh calls.

**Rationale:** When a 401 occurs (access token expired), the interceptor calls `POST /api/v1/auth/refresh` with the stored refresh token. If successful, it retries the original failed request. If the refresh also fails (refresh token expired/revoked), it logs the user out. A retry queue ensures that concurrent 401s don't trigger multiple refresh calls.

**Pattern:**
```
isRefreshing = false
failedQueue = []

on 401:
  if not isRefreshing:
    isRefreshing = true
    call refresh endpoint
    if success: retry all queued requests, reset isRefreshing
    if fail: logout, reject all queued
  else:
    add to failedQueue, wait for refresh to complete
```

### Decision 3: Store architecture — flat stores, not a global store

**Choice:** Keep 4 separate Zustand stores rather than one monolithic store.

**Rationale:** Each store has a distinct responsibility. Separating them prevents unnecessary re-renders (components only subscribe to the store they need) and keeps each store under 100 lines. Zustand's `create` + selectors makes this efficient.

### Decision 4: Hooks as bridges between stores and TanStack Query

**Choice:** `useAuth` hook combines authStore (for tokens) with TanStack Query (for `GET /api/v1/auth/me` user profile fetching). `useCart` hook combines cartStore (local cart) with TanStack Query (for `POST /api/v1/pedidos/` order submission).

**Rationale:** This separation keeps stores pure (no async data fetching) while hooks handle server synchronization. The store holds UI/client state; TanStack Query manages server cache.

## Architecture

### Store Layer (Zustand)

```
authStore                    cartStore                   paymentStore                  uiStore
├─ accessToken               ├─ items[]                  ├─ method                     ├─ sidebarOpen
├─ refreshToken              │  ├─ productId             ├─ processing                 ├─ modals[]
├─ user (UserRead | null)    │  ├─ name                  ├─ status (idle|processing    ├─ toasts[]
├─ isLoading                 │  ├─ price                 │           |success|error)    │  ├─ id
├─ hasError                  │  ├─ quantity              ├─ errorMessage               │  ├─ type
├─ login(email, pass)        │  ├─ imageUrl              ├─ setMethod(method)          │  ├─ message
├─ logout()                  ├─ total                    ├─ startProcessing()          ├─ isLoading
├─ refreshTokens()           ├─ itemCount                ├─ setSuccess()               ├─ toggleSidebar()
├─ setUser(user)             ├─ addItem(product,qty)     ├─ setError(msg)              ├─ openModal(id)
├─ clearAuth()               ├─ removeItem(productId)    └─ reset()                    ├─ closeModal(id)
└─ isAuthenticated (derived)  ├─ updateQty(productId,qty)                              ├─ addToast(toast)
                              ├─ clearCart()                                           ├─ removeToast(id)
                              └─ getItem(productId)                                    └─ setLoading(val)
```

### Hook Layer

```
useAuth()                              useCart()
├─ user (from authStore)               ├─ items (from cartStore)
├─ isAuthenticated (derived)           ├─ total
├─ isLoading (from useQuery)           ├─ itemCount
├─ login(email, pass)                  ├─ addItem(product, qty)
├─ logout()                            ├─ removeItem(productId)
├─ register(data)                      ├─ updateQty(productId, qty)
├─ refreshProfile()                    ├─ clearCart()
└─ (uses TanStack Query for /me)       ├─ submitOrder(addressId) → mutation
                                       └─ lastOrder (from mutation)
```

### Data Flow

```
User clicks "Add to Cart"
  → CartItem component calls useCart().addItem(product, 1)
    → cartStore.addItem() updates items[], total, itemCount
      → CartDrawer re-renders (subscribed to items)
      → Header badge re-renders (subscribed to itemCount)

User submits checkout
  → CheckoutPage calls useCart().submitOrder(addressId)
    → cartStore.items[] → POST /api/v1/pedidos/
    → on success: cartStore.clearCart(), navigate to orders
    → on error: show toast via uiStore.addToast()

App loads (page refresh)
  → authStore.persist rehydrates tokens from localStorage
  → useAuth() detects isAuthenticated → triggers useQuery for GET /api/v1/auth/me
  → on success: authStore.setUser(user)
  → on 401: authStore.clearAuth(), redirect to /login
```

## API Changes

No backend API changes. The Axios interceptor behavior changes:

| Current Behavior | New Behavior |
|----------------|--------------|
| Reads `access_token` from `localStorage.getItem` directly | Reads from `authStore.getState().accessToken` via Zustand |
| 401 handler logs warning only | 401 handler attempts token refresh, retries request, or logs out |
| No token refresh logic | Full refresh flow with retry queue |

## Risks / Mitigations

| Risk | Mitigation |
|------|------------|
| Token refresh race condition (multiple 401s simultaneously) | Retry queue pattern — only one refresh call at a time; queued requests wait and retry |
| Zustand persist + security (tokens in localStorage) | Tokens in localStorage are vulnerable to XSS. Mitigation: set `httpOnly` cookies in future; for now, note as known limitation. Refresh tokens have 7-day expiry and server-side revocation. |
| Cart data loss on accidental refresh | Intentional — cart is session-only. If persistence is desired later, can add another store with persist. |
| Concurrent store subscriptions causing re-render loops | Use Zustand shallow selectors in components; avoid subscribing to entire stores |

## Open Questions

- Should we add `zustand/devtools` middleware in development mode for debugging? → Yes, wrap stores with `devtools` when `import.meta.env.DEV` is true.
- Should we add `immer` middleware for nested state in cart? → No, keep cart items flat; use array methods.
