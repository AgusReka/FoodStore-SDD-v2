## Context

The FoodStore application has a fully functional backend stack for orders (`pedidos`), payments (`pagos`), and addresses (`direcciones`), along with a Zustand-based cart store and a slide-out cart drawer widget used across public pages. However, the dedicated Cart Page and Checkout Page are bare stubs with no route registration. Customers currently can only interact with their cart via the drawer — there is no full-page cart review or checkout flow.

This change delivers the missing customer-facing cart and checkout pages, connecting the existing frontend infrastructure to the backend order/payment/address APIs.

## Goals / Non-Goals

**Goals:**
- Full Cart Page (`/cart`) with item list, quantity controls, per-item subtotals, total summary, and checkout CTA
- Full Checkout Page (`/checkout`) with order summary, delivery address selection, payment method selection, and place-order action
- Proper loading, empty, error, and success states on both pages
- Wire checkout submission to existing `POST /pedidos` and `POST /pagos` endpoints
- Route registration for both pages in the React router
- Stock re-validation before order submission
- **Auth guard on "add to cart"**: prevent guest users from adding items (redirect to login)
- **LoginForm refactor**: use `useAuth` hook, proper error messages, no fragile useEffect patterns
- **Auto-login post-register**: seamless onboarding — user registers and is immediately logged in
- **Contextual header**: show login/register when logged out, profile/orders when logged in
- **Brand color consistency**: replace blue-600 with Mesa orange across all customer components
- **Orders route registration**: fix broken link from ProfilePage

**Non-Goals:**
- No backend changes — existing services, repositories, and endpoints are sufficient
- No changes to the cart drawer — it remains the "quick cart" experience
- No coupon/discount logic — out of scope for MVP
- No saved payment methods or recurring payments
- No multi-step checkout wizard — single-page checkout is sufficient
- No full order history page implementation — only route registration + stub
- No address management from profile page — addresses are managed inline during checkout

## Decisions

1. **Single-page checkout over multi-step wizard**
   - **Why**: Fewer page transitions = faster checkout. The form is simple enough (address + payment method) to fit on one scrollable page. Multi-step adds complexity without clear UX benefit for MVP.
   - **Alternative considered**: Wizard-style with step indicators — rejected for MVP due to added complexity.

2. **Address selection uses existing `GET /direcciones` endpoint**
   - **Why**: The addresses module already supports listing, creating, updating, and deleting addresses. No new backend work is needed. The checkout page will fetch addresses and let the user pick one.
   - **Edge case**: If the user has no addresses, show a "create address" inline form or redirect to profile.

3. **Payment method selection is client-side only (UI choice)**
   - **Why**: For MVP, the payment method is stored as a string field on the payment record (`metodo_pago`). The backend already accepts it. No payment gateway integration is included.
   - **Future**: When a real payment gateway is integrated, this becomes a more complex flow with redirects/webhooks.

4. **Stock re-validation at checkout time**
   - **Why**: Stock can change between when the user adds an item and when they check out. The existing `useCart` hook already validates stock per-item before navigating to checkout. We'll add a final server-side validation (handled by `OrderService.create_order` which already checks stock).
   - **UX**: If stock fails at submission, show inline error per item rather than losing the entire cart.

5. **TanStack Query mutations for order + payment submission**
   - **Why**: The existing `useCart` hook already uses TanStack Query's `useMutation` for order creation. We extend this pattern with a payment mutation. This gives us loading states, error handling, and cache invalidation for free.
   - **Alternative considered**: Direct fetch calls — rejected because we lose reactive state management.

6. **Cart page reuses existing Zustand store directly**
   - **Why**: The cart store (`cartStore.ts`) already has all the state and actions needed (items, total, itemCount, addItem, removeItem, updateQuantity, clearCart). The cart page will consume the store directly via `useCartStore`.
   - **No new store needed**: The checkout flow will create a `useCheckout` hook that wraps the existing cart store + order mutation + payment mutation.

7. **Auth guard on add-to-cart (ProductCard + ProductDetail)**
   - **Why**: Guest users can currently add items to an in-memory cart that will be lost on page refresh or login. Instead of silently losing items, redirect them to login so they understand they need an account.
   - **How**: In both `ProductCard` and `ProductDetail`, read `useAuthStore.accessToken`. If null, call `navigate('/login?redirect=/productos/{id}')`. The `?redirect` param ensures they return to the product after login.
   - **Edge case**: The `CartDrawer` already handles this on checkout — no changes needed there.
   - **Alternative considered**: Allow guest cart and merge on login — rejected because Zustand has no persistence and the complexity isn't worth it for MVP.

8. **LoginForm refactor to useAuth hook**
   - **Why**: Currently `LoginForm` directly uses `useAuthStore` while `RegisterForm` uses the `useAuth` hook. This inconsistency means different error handling patterns and duplicated logic.
   - **How**: Replace `useAuthStore` calls in `LoginForm` with the `useAuth` hook. Get `login`, `isLoading`, and error from the hook. Remove the fragile `useEffect` watching `hasError` from the store.
   - **Error handling**: Instead of hardcoded "Email o contraseña incorrectos", use the actual error from the API. The backend returns clear messages ("Invalid email or password", "Account is inactive", etc.).

9. **Auto-login after registration**
   - **Why**: After registering, the user is redirected to `/login?email=...` and must log in manually. This adds friction — the user just created an account, they should be logged in immediately.
   - **How**: In `RegisterPage.handleRegisterSuccess`, after `register()` succeeds, call `login()` with the same email+password, then navigate to `/`. If login fails (edge case), fall back to the current behavior (redirect to `/login`).
   - **Risk**: If the backend takes time to create the user, the subsequent login might fail. Mitigation: the register endpoint returns immediately on success, so the user exists by the time we call login.

10. **Contextual Header with auth-aware nav links**
    - **Why**: Currently the header only shows "Menú" and a cart icon. Unauthenticated users have no way to find login/register, and authenticated users have no quick access to profile/orders.
    - **How**: In `Header.tsx`, read `useAuthStore.accessToken`. If null, show "Iniciar Sesión" and "Registrarse" links. If present, show "Mi Perfil", "Mis Pedidos", and "Cerrar Sesión" links.
    - **Layout**: Desktop — horizontal links in the nav area. Mobile — hamburger menu or dropdown (keep simple for MVP).
    - **Alternative considered**: Using `ProtectedRoute` for `/profile` and `/orders` — those routes are already protected, the header just provides navigation convenience.

11. **Brand color alignment (blue → Mesa orange)**
    - **Why**: `ProductCard`, `ProductDetail`, `ProfilePage`, and `ProtectedRoute` use `bg-blue-600` / `border-blue-500` while the rest of the Mesa design system uses `var(--brand)` (warm orange). This creates visual inconsistency.
    - **How**: Replace all `bg-blue-6*` and `border-blue-5*` with the corresponding `var(--brand)` / `var(--brand-hover)` tokens across customer-facing components.
    - **Scope**: Only customer-facing components. Admin panel components remain with their own styling.

12. **Orders route registration**
    - **Why**: `ProfilePage` links to `/orders` but the route is not registered in `App.tsx`, causing a 404.
    - **How**: Add `<Route path="/orders" element={<OrdersPage />} />` inside a `ProtectedRoute` wrapper in `App.tsx`. The `OrdersPage` stub renders "Historial de pedidos" — sufficient for this change. Full implementation is deferred.

## Risks / Trade-offs

- **[Payment] No real payment gateway** → The payment record is created but no actual charge occurs. This is acceptable for MVP but must be documented as a known limitation. Migration path: when a gateway is integrated, replace the `POST /pagos` call with the gateway's checkout flow.
- **[State loss] Page refresh during checkout clears cart** → The cart store is in-memory (Zustand with no persistence middleware). Adding `persist` middleware is a future enhancement. For now, the user would need to re-add items.
- **[Address] User has no saved addresses** → The checkout page must handle this gracefully. The simplest approach for MVP: show an "add address" link/button that opens an inline form or navigates to profile settings. We'll go with showing the create-address form inline in a modal.
- **[Race condition] Stock changes between page load and submission** → Backend validation handles this. The `OrderService.create_order` atomically checks stock within the transaction. If stock changed, the order fails with 409 and the user sees an error message.
- **[Auth] Unauthenticated users cannot check out** → The existing `ProtectedRoute` component on the `/checkout` route will redirect to login. The cart drawer already handles this by redirecting to login before checkout. This is documented behavior.
- **[Auth guard] Redirect loops** → If the user is on `/productos/:id` and is redirected to `/login?redirect=/productos/:id`, after login they return to the product page. But `ProductDetailPage` refetches data, so the experience is seamless. No loop risk because `LoginPage` checks if already authenticated and redirects away.
- **[Auto-login] Race condition** → The register endpoint returns the user object on success, but login immediately after might fail if the auth tokens aren't ready. Mitigation: we call login imperatively after register completes, and if it fails, we fall back to redirecting to `/login?email=...` (current behavior).
- **[Header] Admin routes also get the contextual header** → Admin layout has its own sidebar, and the customer Header will still render above it. This is acceptable for MVP but adds visual noise in admin. Future: exclude Header on `/admin/*` routes or let admin layout override.
