## Why

The current client-facing UI lacks a cohesive, polished design identity. It uses basic Tailwind styling without a unified design system, resulting in inconsistent spacing, typography, and component patterns across pages. The Mesa Design System provides an Apple-inspired, warm-orange brand experience specifically designed for food e-commerce — with proper responsive patterns, microinteractions, glassmorphism aesthetics, and production-ready components. Adopting it will significantly improve UX, visual consistency, and conversion potential.

## What Changes

- **CSS Foundation**: Replace minimal CSS variables with full Mesa Design Token system including Google Fonts (Inter Tight + Inter), keyframe animations (float-up, slide-in-right, fade-in), utility classes (.glass, .btn, .card, .input, .chip, .stagger, .ambient), and scrollbar/focus styling
- **Layout**: Replace sticky Header with floating glass pill Navbar (scroll-reactive shadow, centered, fixed position); add ambient background gradient
- **Landing Page**: Replace simple catalog listing with full marketing Landing Page (Hero 2-col with visual card, TrustStrip stats, CategoryRail, FiltersRow, ProductGrid stagger, ChefsRail, CTA Banner)
- **Product Card**: Redesign with FoodArt CSS gradient placeholder, hover lift animation, favorite button, chef meta + Stars rating, tag badges, Counter
- **Product Detail**: Change from full page to modal (desktop: centered 680px overlay, mobile: bottom sheet 90vh)
- **Cart**: Desktop: right drawer 460px with slide-in animation; Mobile: full-screen page; add ShippingBar, fee breakdown, tip selector
- **Checkout**: Restructure as 3-step flow (Entrega → Pago → Resumen) with responsive layout (mobile: accordion, desktop: 2-col with sticky summary)
- **Auth (Login/Register/ForgotPass)**: Desktop: centered modal 420px with backdrop blur; Mobile: full-screen page; add Google OAuth support, password strength bar, show/hide toggle
- **Profile**: Restructure with 2-col layout (desktop: sidebar 240px + content; mobile: horizontal tabs); avatar card, address management, settings
- **Search**: Replace inline SearchBar with SearchPalette (command palette style, keyboard nav, grouped results, recent searches)
- **Shared components**: Add EmptyState, ToastStack, ShippingBar, useBreakpoint hook, CONFIG brand object
- **Footer**: Build out from current empty state with Mesa-style links and location badge

## Capabilities

### New Capabilities
- `customer-home-landing`: Mesa Landing Page with Hero, TrustStrip stats, ChefsRail, and CTA Banner section
- `customer-profile-ui`: Mesa Profile page with 2-col layout, tabs, avatar card, addresses, and settings

### Modified Capabilities
- `frontend-styling`: Add Mesa Design Tokens (full CSS variable set, fonts, keyframes, utility classes)
- `customer-header`: Replace with Mesa Navbar (floating glass pill, scroll-reactive, search + cart)
- `customer-catalog-page`: Mesa catalog with product grid stagger, filter toggle chips, category rail with icons
- `customer-product-detail`: Mesa product modal/bottom-sheet with FoodArt, chef meta, stars, Counter
- `customer-cart-page`: Mesa cart (desktop drawer 460px, mobile full-screen, ShippingBar, tip selector)
- `customer-checkout-flow`: Mesa 3-step checkout with delivery/payment/summary steps, responsive 2-col
- `frontend-auth-ui`: Mesa auth modal pattern (desktop: modal with backdrop blur, mobile: full-screen), Google OAuth, password strength
- `customer-order-history`: Mesa-styled order cards with status badges, mono-font IDs
- `customer-order-detail`: Mesa-styled success banner, timeline, price formatting

## Impact

- **Frontend only**: No backend, database, or API changes
- **~33 files affected**: 8 widgets (4 replace + 4 new), 12 pages (re-style), 6 feature components (adapt), 3 base files (CSS + Layout + App), 1 new hook, 3 base files
- **CSS**: Full token set expansion in index.css (non-breaking — extends existing variables)
- **Dependencies**: Google Fonts (Inter Tight + Inter) required; no new npm packages beyond that
- **Responsive**: All views must work on 375px mobile to 1280px+ desktop (new requirement — many current pages lack mobile optimization)
