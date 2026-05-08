## ADDED Requirements

### Requirement: Zustand installed as a dependency

The frontend SHALL install `zustand` as a runtime dependency.

#### Scenario: Zustand available in package.json
- **WHEN** the developer inspects `frontend/package.json`
- **THEN** `zustand` SHALL appear in the `dependencies` section

### Requirement: Auth store manages authentication state

The frontend SHALL have an `authStore` (Zustand) that manages authentication tokens and user profile.

#### Scenario: Store initialized with default state
- **WHEN** the app loads without prior authentication
- **THEN** `authStore` SHALL have `accessToken: null`, `refreshToken: null`, `user: null`, `isLoading: false`, `hasError: false`
- **AND** `isAuthenticated` SHALL be `false`

#### Scenario: Login action stores tokens
- **WHEN** `authStore.login(email, password)` resolves successfully from `POST /api/v1/auth/login`
- **THEN** `accessToken` SHALL be set to the access token string
- **AND** `refreshToken` SHALL be set to the refresh token string
- **AND** `isAuthenticated` SHALL be `true`

#### Scenario: Logout clears all auth state
- **WHEN** `authStore.logout()` is called and `POST /api/v1/auth/logout` resolves successfully
- **THEN** `accessToken` SHALL be `null`
- **AND** `refreshToken` SHALL be `null`
- **AND** `user` SHALL be `null`
- **AND** tokens SHALL be removed from persistent storage

#### Scenario: Token refresh updates tokens
- **WHEN** `authStore.refreshTokens()` is called with a valid stored refresh token
- **THEN** `accessToken` SHALL be updated with the new access token
- **AND** `refreshToken` SHALL be updated with the new refresh token
- **AND** the new tokens SHALL be persisted

#### Scenario: Set user profile
- **WHEN** `authStore.setUser(userData)` is called with a `UserRead` object
- **THEN** `user` SHALL contain the user data
- **AND** `isAuthenticated` SHALL still be `true`

#### Scenario: Auth tokens persist across page refresh
- **WHEN** the user refreshes the page
- **THEN** `accessToken` and `refreshToken` SHALL be restored from localStorage
- **AND** `user` SHALL be `null` (profile must be re-fetched)

### Requirement: Cart store manages shopping cart state

The frontend SHALL have a `cartStore` (Zustand) that manages the in-memory shopping cart.

#### Scenario: Store initialized with empty cart
- **WHEN** the store is created
- **THEN** `items` SHALL be an empty array
- **AND** `total` SHALL be `0`
- **AND** `itemCount` SHALL be `0`

#### Scenario: Add item to cart
- **WHEN** `cartStore.addItem({ productId, name, price, imageUrl }, quantity)` is called
- **THEN** the item SHALL be added to `items`
- **AND** if the product already exists in the cart, the quantity SHALL be incremented instead of adding a duplicate
- **AND** `total` SHALL be recalculated
- **AND** `itemCount` SHALL be incremented

#### Scenario: Remove item from cart
- **WHEN** `cartStore.removeItem(productId)` is called
- **THEN** the item SHALL be removed from `items`
- **AND** `total` SHALL be recalculated
- **AND** `itemCount` SHALL be decremented

#### Scenario: Update item quantity
- **WHEN** `cartStore.updateQuantity(productId, newQuantity)` is called
- **THEN** the item's quantity SHALL be updated
- **AND** `total` SHALL be recalculated
- **AND** `itemCount` SHALL be recalculated
- **AND** if `newQuantity` is 0 or less, the item SHALL be removed

#### Scenario: Clear cart
- **WHEN** `cartStore.clearCart()` is called
- **THEN** `items` SHALL be an empty array
- **AND** `total` SHALL be `0`
- **AND** `itemCount` SHALL be `0`

#### Scenario: Get item by productId
- **WHEN** `cartStore.getItem(productId)` is called
- **THEN** it SHALL return the cart item if found, or `undefined` if not in cart

### Requirement: Payment store manages checkout payment state

The frontend SHALL have a `paymentStore` (Zustand) that manages the payment flow during checkout.

#### Scenario: Store initialized with default state
- **WHEN** the store is created
- **THEN** `method` SHALL be an empty string or default value
- **AND** `processing` SHALL be `false`
- **AND** `status` SHALL be `"idle"`
- **AND** `errorMessage` SHALL be `null`

#### Scenario: Set payment method
- **WHEN** `paymentStore.setMethod("mercadopago")` is called
- **THEN** `method` SHALL be `"mercadopago"`

#### Scenario: Start processing
- **WHEN** `paymentStore.startProcessing()` is called
- **THEN** `processing` SHALL be `true`
- **AND** `status` SHALL be `"processing"`

#### Scenario: Set success
- **WHEN** `paymentStore.setSuccess()` is called
- **THEN** `processing` SHALL be `false`
- **AND** `status` SHALL be `"success"`

#### Scenario: Set error
- **WHEN** `paymentStore.setError("Payment declined")` is called
- **THEN** `processing` SHALL be `false`
- **AND** `status` SHALL be `"error"`
- **AND** `errorMessage` SHALL be `"Payment declined"`

#### Scenario: Reset payment state
- **WHEN** `paymentStore.reset()` is called
- **THEN** all values SHALL return to their initial defaults

### Requirement: UI store manages global UI state

The frontend SHALL have a `uiStore` (Zustand) that manages transient UI concerns.

#### Scenario: Store initialized with default state
- **WHEN** the store is created
- **THEN** `sidebarOpen` SHALL be `false`
- **AND** `modals` SHALL be an empty array
- **AND** `toasts` SHALL be an empty array
- **AND** `isLoading` SHALL be `false`

#### Scenario: Toggle sidebar
- **WHEN** `uiStore.toggleSidebar()` is called
- **THEN** `sidebarOpen` SHALL be toggled

#### Scenario: Open and close modals
- **WHEN** `uiStore.openModal("checkout")` is called
- **THEN** `"checkout"` SHALL be added to `modals` array
- **WHEN** `uiStore.closeModal("checkout")` is called
- **THEN** `"checkout"` SHALL be removed from `modals` array

#### Scenario: Toast notifications
- **WHEN** `uiStore.addToast({ type: "success", message: "Order placed" })` is called
- **THEN** a new toast object with a unique `id` SHALL be added to `toasts`
- **WHEN** `uiStore.removeToast(toastId)` is called
- **THEN** the toast SHALL be removed from `toasts`

#### Scenario: Global loading state
- **WHEN** `uiStore.setLoading(true)` is called
- **THEN** `isLoading` SHALL be `true`
- **WHEN** `uiStore.setLoading(false)` is called
- **THEN** `isLoading` SHALL be `false`

### Requirement: Stores export barrel

The `shared/stores/index.ts` file SHALL re-export all stores.

#### Scenario: All stores exported
- **WHEN** a file imports from `@shared/stores` or `shared/stores`
- **THEN** `useAuthStore`, `useCartStore`, `usePaymentStore`, and `useUiStore` SHALL be available

### Requirement: useAuth hook combines store and server data

The frontend SHALL have a `useAuth` hook that combines `authStore` with TanStack Query for profile fetching.

#### Scenario: Hook returns combined state
- **WHEN** `useAuth()` is called
- **THEN** it SHALL return `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `register`, and `refreshProfile`
- **AND** `isLoading` SHALL reflect the TanStack Query loading state for `GET /api/v1/auth/me`

#### Scenario: Auto-fetch profile when authenticated
- **WHEN** authStore has a valid `accessToken`
- **THEN** `useAuth` SHALL automatically trigger `useQuery` for `GET /api/v1/auth/me`
- **AND** the user profile SHALL be stored in `authStore.user`

#### Scenario: Auto-redirect on auth failure
- **WHEN** `GET /api/v1/auth/me` returns 401
- **THEN** `authStore.clearAuth()` SHALL be called
- **AND** `isAuthenticated` SHALL become `false`

### Requirement: useCart hook combines store and order submission

The frontend SHALL have a `useCart` hook that combines `cartStore` with TanStack Query for order submission.

#### Scenario: Hook returns cart state and actions
- **WHEN** `useCart()` is called
- **THEN** it SHALL return `items`, `total`, `itemCount`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `submitOrder`, and `lastOrder`

#### Scenario: Submit order mutation
- **WHEN** `useCart().submitOrder(addressId)` is called
- **THEN** a `useMutation` SHALL send `POST /api/v1/pedidos/` with cart items
- **AND** on success, `cartStore.clearCart()` SHALL be called
- **AND** `lastOrder` SHALL contain the created order

### Requirement: Hooks export barrel

The `shared/hooks/index.ts` file SHALL re-export all hooks.

#### Scenario: All hooks exported
- **WHEN** a file imports from `@shared/hooks` or `shared/hooks`
- **THEN** `useAuth` and `useCart` SHALL be available
