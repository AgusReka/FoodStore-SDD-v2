## 1. Route Registration

- [x] 1.1 Add `/cart` route pointing to `CartPage` in `App.tsx` (public route, within Layout)
- [x] 1.2 Add `/checkout` route pointing to `CheckoutPage` in `App.tsx` (protected route via `ProtectedRoute`)

## 2. Cart Page

- [x] 2.1 Implement full `CartPage.tsx` with item list, quantity controls (+/−), delete button, per-item subtotals, and total summary
- [x] 2.2 Implement empty state ("Tu carrito está vacío" + "Ver productos" button → navigates to `/`)
- [x] 2.3 Implement "Ir al checkout" CTA that redirects to `/login` if unauthenticated, else navigates to `/checkout`
- [x] 2.4 Apply Mesa Design System styling: responsive layout (single column mobile, two columns desktop), orange accent, consistent spacing

## 3. Cart Feature Components

- [x] 3.1 Flesh out `CartItem.tsx` with product image, name, price, quantity selector (+/−), delete button, and subtotal display
- [x] 3.2 Flesh out `CartSummary.tsx` with item count, subtotal row, optional delivery fee row, total row, and checkout CTA

## 4. Checkout Page — Order Review & Address Selection

- [x] 4.1 Implement order summary section on `CheckoutPage.tsx` listing all cart items with name, quantity, unit price, and subtotal
- [x] 4.2 Implement address section: fetch addresses via `GET /api/v1/direcciones`, display address cards, allow selection, pre-select principal address
- [x] 4.3 Implement empty address state: show "No tenés direcciones guardadas" + "Agregar dirección" button
- [x] 4.4 Implement inline address creation form/modal (fields: calle, ciudad, código postal) that calls `POST /api/v1/direcciones`
- [x] 4.5 Redirect empty cart to `/cart` with appropriate message

## 5. Checkout Page — Payment & Order Submission

- [x] 5.1 Implement payment method selector with radio buttons (Efectivo, Transferencia, Mercado Pago)
- [x] 5.2 Implement "Confirmar pedido" button that calls `POST /api/v1/pedidos` with cart items and selected `address_id`
- [x] 5.3 On order success, call `POST /api/v1/pagos` with `pedido_id`, `payment_method`, and `amount`
- [x] 5.4 Handle order submission loading state: spinner on button, button text "Procesando...", disable all inputs
- [x] 5.5 Handle order submission success: clear cart, navigate to order confirmation with order ID
- [x] 5.6 Handle stock errors: display inline error messages per item, do NOT clear cart
- [x] 5.7 Handle network/generic errors: display error message with "Reintentar" button, do NOT clear cart
- [x] 5.8 Apply Mesa Design System styling consistent with cart page

## 6. Protected & Edge Case Handling

- [x] 6.1 Ensure `/checkout` is wrapped in `ProtectedRoute` so unauthenticated users redirect to `/login`
- [x] 6.2 Verify cart drawer "Ir al checkout" still works with the new route (now uses `/login?redirect=%2Fcheckout`)
- [x] 6.3 Verify all pages handle the "back to empty cart" / "navigate to products" UX flows

## 7. Auth Guard — Add to Cart

- [x] 7.1 Add auth check in `ProductCard.tsx`: if not authenticated, `navigate('/login?redirect=/productos/' + product.id)`, else call `addItem` normally
- [x] 7.2 Add auth check in `ProductDetail.tsx`: same redirect pattern as ProductCard
- [x] 7.3 Verify CartDrawer behavior remains consistent — no change needed but confirm auth check still works end-to-end

## 8. Login/Register Refactor

- [x] 8.1 Refactor `LoginForm.tsx` to use `useAuth` hook instead of direct `useAuthStore`
- [x] 8.2 Fix error handling: display actual API error messages (not hardcoded "Email o contraseña incorrectos")
- [x] 8.3 Remove fragile `useEffect` watching `hasError` from store; handle errors directly from catch block
- [x] 8.4 Implement auto-login after successful registration in `RegisterPage.tsx`: after `register()` resolves, call `login()` with same credentials, then navigate to `/`
- [x] 8.5 Add fallback: if auto-login fails, redirect to `/login?email=...` (preserve current behavior as fallback)
- [x] 8.6 Add password visibility toggle (show/hide button) to both LoginForm and RegisterForm

## 9. Header Auth Context

- [x] 9.1 Add login/register nav links to `Header.tsx` when user is NOT authenticated
- [x] 9.2 Add profile/orders/logout nav links to `Header.tsx` when user IS authenticated
- [x] 9.3 Use `useAuthStore` selectors (`accessToken`, `user`) to drive conditional rendering
- [x] 9.4 Style auth links consistently with Mesa design (brand orange hover, proper spacing)
- [x] 9.5 Ensure header remains sticky and glassmorphism effect is preserved with new links
- [x] 9.6 Test header on all viewport sizes (mobile hamburger or stacked layout if needed)

## 10. UI Consistency — Brand Colors

- [x] 10.1 Update `ProductCard.tsx`: replace `bg-blue-600` → `bg-[var(--brand)]` and `hover:bg-blue-700` → `hover:bg-[var(--brand-hover)]`
- [x] 10.2 Update `ProductDetail.tsx`: same brand color replacement for "Agregar al carrito" button
- [x] 10.3 Update `ProfilePage.tsx`: replace `bg-blue-600` CTA buttons with brand colors
- [x] 10.4 Update `ProtectedRoute.tsx`: replace `border-blue-500` spinner with `border-[var(--brand)]`
- [x] 10.5 Verify consistency across all customer-facing components (LoginForm, RegisterForm already use their own styles — confirm they match)

## 11. Orders Route Registration

- [x] 11.1 Import `OrdersPage` and add `/orders` route in `App.tsx` wrapped in `ProtectedRoute`
- [x] 11.2 Ensure `OrdersPage` stub renders basic heading ("Mis Pedidos") and description
- [x] 11.3 Verify navigation flow: ProfilePage "Ver mis pedidos" link → `/orders` → renders correctly
