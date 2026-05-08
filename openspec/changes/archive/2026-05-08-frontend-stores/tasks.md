## 1. Setup & Dependencies

- [x] 1.1 Install `zustand` npm dependency in frontend/package.json and run `pnpm install`
- [x] 1.2 Create directory structure: ensure `shared/stores/`, `shared/hooks/`, `shared/config/`, `shared/api/` exist with proper index files

## 2. Config Layer

- [x] 2.1 Implement `shared/config/constants.ts` with app-wide constants (token keys, expiry times, pagination defaults)
- [x] 2.2 Implement `shared/config/routes.ts` with all route path constants and dynamic route helpers

## 3. API Client Layer

- [x] 3.1 Implement `shared/api/endpoints.ts` with all API endpoint path constants (auth, products, categories, orders, payments, addresses, admin, health)
- [x] 3.2 Implement `shared/api/client.ts` with typed API helper functions (get, post, patch, delete)
- [x] 3.3 Update `shared/api/axios.ts` — replace localStorage token read with authStore access, implement token refresh retry queue on 401
- [x] 3.4 Update `shared/api/index.ts` barrel export to re-export all API modules (apiClient, endpoints, queryKeys, typed helpers)

## 4. State Management Layer (Zustand Stores)

- [x] 4.1 Implement `authStore.ts` with Zustand + persist middleware: state (accessToken, refreshToken, user, isLoading, hasError) and actions (login, logout, refreshTokens, setUser, clearAuth)
- [x] 4.2 Implement `cartStore.ts` with Zustand (in-memory): state (items[], total, itemCount) and actions (addItem, removeItem, updateQuantity, clearCart, getItem)
- [x] 4.3 Implement `paymentStore.ts` with Zustand (in-memory): state (method, processing, status, errorMessage) and actions (setMethod, startProcessing, setSuccess, setError, reset)
- [x] 4.4 Implement `uiStore.ts` with Zustand (in-memory): state (sidebarOpen, modals[], toasts[], isLoading) and actions (toggleSidebar, openModal, closeModal, addToast, removeToast, setLoading)
- [x] 4.5 Update `shared/stores/index.ts` barrel export to re-export all stores

## 5. Hook Layer

- [x] 5.1 Implement `useAuth.ts` hook: combines authStore + TanStack Query (useQuery for GET /api/v1/auth/me, auto-fetch when authenticated, auto-clear on 401)
- [x] 5.2 Implement `useCart.ts` hook: combines cartStore + TanStack Query (useMutation for POST /api/v1/pedidos/, clear cart on success)
- [x] 5.3 Update `shared/hooks/index.ts` barrel export to re-export all hooks
