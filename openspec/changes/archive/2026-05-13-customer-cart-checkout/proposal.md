## Why

The FoodStore application has fully functioning backend modules for orders (`pedidos`), payments (`pagos`), and addresses (`direcciones`), along with a Zustand cart store and a cart drawer widget. However, the dedicated **Cart Page** and **Checkout Page** are only bare stubs, and neither route is registered in the React router. Customers cannot review their full cart or complete a purchase through the UI. This change delivers the missing customer-facing cart and checkout experience, connecting the existing cart store with the order and payment backend.

## What Changes

### Cart & Checkout (scope original)
- Implement a full **Cart Page** (`/cart`) with item list, quantity controls, per-item subtotals, total summary, and a checkout CTA
- Implement a full **Checkout Page** (`/checkout`) with order review, delivery address selection, payment method selection, and place order flow
- Flesh out the `CartItem` and `CartSummary` feature components with proper UI
- Register `/cart` and `/checkout` routes in the React router (`App.tsx`)
- Wire the checkout flow to call `POST /api/v1/pedidos` to create the order and `POST /api/v1/pagos` to record payment
- Add stock re-validation on checkout submission (server-side + client-side)
- Handle loading, empty, error, and success states on both pages

### Auth Guard — Add to Cart
- Add auth guard on "Agregar al carrito" buttons in `ProductCard` and `ProductDetail`: if user is not authenticated, redirect to `/login?redirect={returnUrl}` before calling `addItem`
- Prevent guest users from adding items to ephemeral session cart that would be lost after login

### Login/Register Refactor
- Refactor `LoginForm` to use `useAuth` hook (consistent with `RegisterForm`) instead of direct `useAuthStore`
- Fix error handling: show real API error messages instead of hardcoded "Email o contraseña incorrectos"
- Eliminate fragile `useEffect` + `hasError` pattern from LoginForm
- Implement **auto-login after registration**: after `register()` succeeds, call `login()` automatically and redirect to home
- Add toggle password visibility (show/hide) on both forms

### Header Auth Context
- Make `Header` contextual: show "Iniciar Sesión" / "Registrarse" links when user is NOT authenticated
- Show "Mi Perfil" / "Mis Pedidos" / "Cerrar Sesión" links when user IS authenticated
- Improve mobile responsiveness of header nav links

### UI Consistency — Brand Colors
- Fix color inconsistency: replace `bg-blue-600` with Mesa brand orange (`bg-[var(--brand)]`) in `ProductCard`, `ProductDetail`, `ProfilePage`, and `ProtectedRoute` spinner
- Ensure all customer-facing components use consistent brand tokens

### Route Registration
- Register `/orders` route in `App.tsx` (wrapped in `ProtectedRoute`) so the link from `ProfilePage` doesn't 404
- Start `OrdersPage` as functional stub (can be fleshed out in future change)

## Capabilities

### New Capabilities
- `customer-cart-page`: Dedicated cart page showing all items, quantities, totals, and navigation to checkout
- `customer-checkout-flow`: Complete checkout flow with address selection, payment method, and order placement
- `customer-auth-ui-refactor`: Consistent login/register patterns, auto-login flow, auth-aware header with contextual nav links

### Modified Capabilities
- `customer-header`: Add auth-aware navigation links (login/register when logged out, profile/orders when logged in)
- `customer-catalog-page`: Add auth guard protection on add-to-cart buttons
- `customer-product-detail`: Add auth guard protection on add-to-cart button

## Impact

- **Frontend**: New files in `frontend/src/pages/` (`CartPage.tsx`, `CheckoutPage.tsx` — replacing stubs), fleshing out `frontend/src/features/cart/` components (`CartItem.tsx`, `CartSummary.tsx`), refactored `LoginForm.tsx`, updated `RegisterPage.tsx` for auto-login, updated `Header.tsx` with auth-aware links, updated `ProductCard.tsx`/`ProductDetail.tsx` with auth guard + brand colors, route registration in `frontend/src/app/App.tsx`
- **Backend**: No changes needed — existing auth, pedidos, pagos, and direcciones modules already support the expanded scope
- **API**: Uses existing endpoints (`POST /auth/login`, `POST /auth/register`, `POST /pedidos`, `POST /pagos`, `GET /direcciones`, `GET /productos/{id}/stock`)
- **Dependencies**: None new — uses existing Zustand auth store, useAuth hook, TanStack Query, and API client
