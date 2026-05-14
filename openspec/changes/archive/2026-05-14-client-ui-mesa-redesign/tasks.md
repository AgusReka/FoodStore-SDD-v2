# Tasks: client-ui-mesa-redesign

## 1. Base — CSS Foundation + Layout + Navbar

- [x] 1.1 Extend `index.css` with Mesa Design Tokens: Google Fonts (@import Inter Tight + Inter), full :root variables, keyframes (float-up, slide-in-right, fade-in, pulse-soft), utility classes (.glass, .btn, .btn-primary, .btn-secondary, .btn-ghost, .btn-glass, .card, .input, .chip, .stagger, .t-display, .section-eyebrow, .ambient, .food-art, .container, .divider), scrollbar styling, focus ring
- [x] 1.2 Create `shared/hooks/useBreakpoint.ts` with `{ isMobile, isTablet, isDesktop, width }` hook
- [x] 1.3 Create `shared/config/brand.ts` with `CONFIG` object (brand name, locale, currency, delivery fees, tip options, feature flags, brand colors)
- [x] 1.4 Update `app/Layout.tsx` to add `<div className="ambient"/>` ambient background and remove stale Header wrapping
- [x] 1.5 Replace `widgets/Header.tsx` with Mesa Navbar: floating glass pill, fixed position top-16, scroll-reactive shadow, logo with brand badge, nav links (Inicio, Menú), search bar embedded on desktop, cart icon with count badge, responsive compact pill on mobile
- [x] 1.6 Create `widgets/ToastStack.tsx` for toast notifications with slide-in animation
- [x] 1.7 Create `widgets/EmptyState.tsx` reusable component with icon, title, description, action CTA

## 2. Landing — HomePage + Product Card + Catalog

- [x] 2.1 Create `widgets/Hero.tsx`: 2-column layout (copy left + visual card right), display headline with gradient text, CTA buttons, trust stats, floating product/delivery chips
- [x] 2.2 Create `widgets/ChefsRail.tsx`: chef profile cards grid for desktop, horizontal scroll for mobile
- [x] 2.3 Create `widgets/CtaBanner.tsx`: full-width dark section with headline, description, and action button
- [x] 2.4 Create `widgets/FiltersRow.tsx`: toggle filter chips (Bajo 20min, Vegano, Trending, Nuevos) with check mark when active
- [x] 2.5 Replace `widgets/ProductCard.tsx` with Mesa ProductCard: FoodArt gradient placeholder, hover lift animation, favorite heart button, Price display, plus button with brand shadow
- [x] 2.6 Update `features/catalog/components/CategoryRail.tsx` to Mesa style: pills with icons, active state with dark bg + translateY, custom scrollbar
- [x] 2.7 Extract `widgets/SearchPalette.tsx` from Header.tsx: command palette style, full-screen on mobile / centered modal 560px on desktop, keyboard nav (↑↓), debounced search 220ms, grouped results, recent searches
- [x] 2.8 Replace `pages/HomePage.tsx` with Mesa Landing Page: Hero, TrustStrip, CategoryRail, FiltersRow, ProductGrid with stagger, ChefsRail, CTA Banner, pagination with Mesa styling

## 3. Auth — Login / Register / Forgot / Reset / Verify

- [x] 3.1 Replace `pages/LoginPage.tsx` with Mesa auth modal pattern: desktop centered modal 420px + backdrop blur, mobile full-screen page, Google OAuth button, password show/hide toggle, inline error display, spinner CTA
- [x] 3.2 Replace `pages/RegisterPage.tsx` with Mesa register: same modal pattern, full name field, password strength bar (4 segments), confirm password, terms note
- [x] 3.3 Replace `pages/ForgotPasswordPage.tsx` with Mesa forgot mode: info callout (brand-soft bg), email field, "← Volver al login" text button, same modal/page pattern
- [x] 3.4 Update `pages/ResetPasswordPage.tsx` with Mesa styling: modal pattern, password fields with strength validation, error states
- [x] 3.5 Update `pages/VerifyEmailPage.tsx` with Mesa styling: success/error states with Mesa components, animated checkmark
- [x] 3.6 Update `features/auth/LoginForm.tsx` and `features/auth/RegisterForm.tsx` to use Mesa Input/Button components and validation patterns

## 4. Cart & Checkout — Cart + Checkout + Product Detail ✅

- [x] 4.1 Replace `widgets/CartDrawer.tsx` with Mesa CartDrawer: desktop right drawer 460px with slide-in-right + backdrop blur, mobile full-screen page, FoodArt items + Counter, ShippingBar, fee breakdown (subtotal/envío/tip/total), EmptyState with suggestions
- [x] 4.2 Replace `pages/CartPage.tsx` with Mesa mobile cart view: full-screen with sticky footer + CTA when `useBreakpoint().isMobile`, mirror of CartDrawer content
- [x] 4.3 Create `widgets/ShippingBar.tsx`: live free delivery progress bar with animated fill
- [x] 4.4 Create `widgets/TipSelector.tsx`: tip percentage options (0%, 10%, 15%, 20%) with pill buttons
- [x] 4.5 Replace `pages/CheckoutPage.tsx` with Mesa 3-step checkout: Step 1 Entrega (AddressForm + delivery speed radio), Step 2 Pago (PaymentSelector + CardForm + TipSelector), Step 3 Resumen (items + address + payment + grand total + confirm). Mobile: accordion. Desktop: 2-col (form left + sticky summary 360px)
- [x] 4.6 Replace `pages/ProductDetailPage.tsx` with Mesa ProductModal: desktop centered modal 680px + float-up animation + backdrop, mobile bottom sheet 90vh, FoodArt, chef chip + Stars rating + tags + ingredients + Counter + CTA

## 5. Profile & Orders — Profile + Orders + Order Detail + Footer ✅

- [x] 5.1 Replace `pages/ProfilePage.tsx` with Mesa Profile: desktop 2-col (sidebar 240px + content area), mobile horizontal tabs, avatar card (initials + name + email + stats), tabs: Mis pedidos / Direcciones / Ajustes, inline edit form, logout button red
- [x] 5.2 Update `pages/OrdersPage.tsx` with Mesa styling: order cards with status badges (Mesa colors), mono-font order ID, total, status filter pills, Mesa EmptyState
- [x] 5.3 Update `pages/OrderDetailPage.tsx` with Mesa styling: success banner animated checkmark, timeline, item list, payment status
- [x] 5.4 Build `widgets/Footer.tsx` with Mesa Footer: links, copyright, location badge, responsive layout

## 6. Bug Fixes — Address naming convention (English)

- [x] 6.1 Fix `shared/hooks/useAddresses.ts` — change `Address` interface fields from Spanish to English (calle→street, numero→street_number, ciudad→city, codigo_postal→postal_code, es_principal→is_primary, removed piso and observaciones).
- [x] 6.2 Fix `pages/ProfilePage.tsx` — update `handleAddressSubmit` to send English field names. Fix all render references: `addr.calle`→`addr.street`, `addr.numero`→`addr.street_number`, `addr.ciudad`→`addr.city`, `addr.es_principal`→`addr.is_primary`, `addr.codigo_postal`→`addr.postal_code`. Removed `piso` and `observaciones` references (not in backend schema).
- [x] 6.3 Replace ProfilePage inline address form with reusable `@entities/address/AddressForm` component. Added required field indicators (`*`) to AddressForm labels and "Campos obligatorios" note. TypeScript compiles with 0 errors.
- [x] 6.4 Search for any other Spanish field name references across frontend that could cause API mismatches. — No other issues found.

## 7. ProductCard Redesign + ProductDetailModal overlay

- [x] 7.1 Fix `ProductGrid.tsx` — remove `opacity-0` class that caused invisible cards (fade-in animation already handles opacity)
- [x] 7.2 Redesign `widgets/ProductCard.tsx` — Mesa-style: Stars rating (4.5), delivery time chip (20-30 min with clock icon), removed heart/fav button, kept ADD button + stock badge + FoodArt + price + ingredients
- [x] 7.3 Add `selectedProductId` state to `shared/stores/uiStore.ts` with `openProductModal(id)` / `closeProductModal()` actions
- [x] 7.4 Create `widgets/ProductDetailModal.tsx` — new overlay modal: desktop centered 680px with backdrop blur + float-up, mobile bottom sheet 93vh with FoodArt hero + sticky CTA. Fetches product data, shows loading/error/not-found states. Add to cart + toast integration. Escape key and backdrop click close.
- [x] 7.5 Update `app/Layout.tsx` — render ProductDetailModal at root level
- [x] 7.6 Update `pages/HomePage.tsx` — product click opens modal instead of navigating to /productos/:id
- [x] 7.7 TypeScript `tsc --noEmit` passes with 0 errors
