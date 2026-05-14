## Context

The FoodStore frontend uses React 18 + TypeScript + TailwindCSS with Feature-Sliced Design (FSD) structure. Current client UI has basic Tailwind styling with CSS variables for brand colors (--brand, --ink, --bg, --surface) already matching Mesa tokens. However, there is no cohesive design system: components use ad-hoc Tailwind classes, responsive behavior is minimal, and the UI lacks the polished microinteractions expected in a food delivery app.

The Mesa Design System (`food-ecommerce-ui` skill) provides production-ready patterns for food e-commerce: glassmorphism nav, gradient food art placeholders, card hover lifts, stagger animations, and responsive layouts. This design documents how to integrate Mesa into the existing architecture without breaking current functionality.

## Goals / Non-Goals

**Goals:**
- Apply Mesa Design System token set, typography (Inter Tight + Inter), keyframes, and utility classes
- Replace Header with floating glass pill Navbar (scroll-reactive, centered, fixed)
- Transform HomePage into marketing Landing Page (Hero, TrustStrip, CategoryRail, Filters, ProductGrid stagger, ChefsRail, CTA Banner)
- Redesign ProductCard with FoodArt, hover lift, favorites, stars, tag badges
- Replace Cart full-page with desktop drawer 460px + mobile full-screen pattern
- Restructure Checkout as 3-step flow with responsive 2-col layout
- Convert ProductDetail to modal (desktop) / bottom-sheet (mobile)
- Convert Auth pages to modal (desktop) / full-screen (mobile) with Google OAuth and password strength
- Restructure Profile as 2-col with sidebar tabs (desktop) / horizontal scroll tabs (mobile)
- Add useBreakpoint responsive hook and CONFIG brand object
- Add shared components: EmptyState, ToastStack, ShippingBar, SearchPalette

**Non-Goals:**
- No backend, database, or API changes
- No changes to admin section styling
- No changes to core Zustand store logic or TanStack Query patterns
- No migration from Tailwind to inline styles (keep Tailwind + Mesa CSS classes together)
- No dark mode implementation (tokens prepared but not activated)
- No changes to routing structure or page URLs

## Decisions

### D1: CSS Strategy — Mesa utility classes alongside Tailwind

**Decision**: Extend `index.css` with Mesa utility classes (`.glass`, `.btn`, `.card`, `.input`, `.chip`, `.stagger`, `.ambient`, `.t-display`, `.section-eyebrow`) that complement existing Tailwind classes. Components may use either Tailwind or Mesa CSS classes depending on the pattern.

**Rationale**: The Mesa skill provides CSS class-based components that are framework-agnostic and work well with Tailwind's utility-first approach. CSS variables (--brand, --ink, etc.) are already shared. Mixing both gives flexibility: Tailwind for layout/spacing, Mesa classes for visual effects (glass, stagger, food-art).

**Alternatives considered**: Pure Tailwind reimplementation of Mesa patterns would require manually recreating every keyframe, glassmorphism formula, and button variant — duplicating work already done in the skill.

### D2: Responsive Strategy — useBreakpoint hook + layout switch

**Decision**: Create a shared `useBreakpoint()` hook that returns `{ isMobile, isTablet, isDesktop, width }`. Components that need different layouts use the pattern:
```tsx
function SomeScreen() {
  const { isMobile } = useBreakpoint();
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

**Rationale**: Mesa defines fundamentally different layouts for mobile vs desktop (e.g., modal vs full-screen, drawer vs page, sidebar vs tabs). A single responsive hook avoids duplicating Tailwind responsive prefixes in every component and makes layout decisions explicit.

**Breakpoints**: Mobile < 768px, Tablet 768-1023px, Desktop ≥ 1024px.

### D3: Component Architecture — Widget layer as Mesa components

**Decision**: Reuse the existing FSD widget layer (`frontend/src/widgets/`) for all shared Mesa components:
- `Header.tsx` → Mesa Navbar (floating glass pill)
- `ProductCard.tsx` → Mesa ProductCard (FoodArt, hover, favorites)
- `CartDrawer.tsx` → Mesa CartDrawer (slide-in panel)
- `Footer.tsx` → Mesa Footer
- New: `Hero.tsx`, `ChefsRail.tsx`, `CtaBanner.tsx`, `ShippingBar.tsx`, `EmptyState.tsx`, `ToastStack.tsx`

Feature components (`frontend/src/features/`) that need Mesa styling updates (SearchBar → SearchPalette, CategoryRail, CartItem) keep their feature folder location but adopt Mesa patterns.

### D4: Page-level responsive switching

**Decision**: Each client page chooses its layout variant based on `useBreakpoint()`:
| Page | Mobile (< 768px) | Desktop (≥ 1024px) |
|------|-----------------|-------------------|
| HomePage | Single-column hero, 1-2 col grid | 2-col hero, 3-4 col grid, all chips visible |
| CartPage | Full-screen page w/ sticky footer | Right drawer 460px + backdrop |
| LoginPage | Full-screen page | Centered modal 420px + backdrop blur |
| RegisterPage | Full-screen page | Centered modal 420px + backdrop blur |
| ForgotPasswordPage | Full-screen page | Centered modal 420px + backdrop blur |
| ProductDetailPage | Bottom sheet 90vh | Centered modal 680px |
| ProfilePage | Horizontal scroll tabs | Sidebar 240px + content area |
| CheckoutPage | Step accordion, full-width | 2-col: form left + sticky summary 360px |
| SearchBar | Full-screen overlay | Centered modal 560px |

### D5: CONFIG brand object

**Decision**: Define a `CONFIG` constant at app root (in `App.tsx` or a new `shared/config/brand.ts`) with brand colors, locale, currency, delivery fees, tip options, and feature flags. Inject CSS variables via `useEffect` on mount. This centralizes all brand configuration and avoids hardcoded values.

**Rationale**: The Mesa skill mandates CONFIG at the top of every generated file. Having a single source of truth prevents brand drift across 30+ components.

### D6: State management — extend existing Zustand stores

**Decision**: Keep existing Zustand stores (`authStore`, `cartStore`, `paymentStore`). Add a new `uiStore` if needed for modal states (loginOpen, cartOpen, searchOpen, productOpen). The Mesa reducer pattern can be replaced by Zustand actions.

**Rationale**: The project already uses Zustand. Creating a reducer alongside would add complexity. The Mesa reducer example is illustrative — the store actions are what matter.

### D7: Pagination for HomePage product grid

**Decision**: During the redesign, keep Pagination component as-is (shared component) but restyle it to match Mesa aesthetics. Future iterations may add infinite scroll, but the current page-based approach works.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Mesa CSS classes may conflict with Tailwind utilities** | Prefix Mesa classes with `.m-` if conflicts arise (e.g., `.m-card`). Test on a single page first. |
| **Layout switch pattern (mobile vs desktop) creates two code paths** | Each layout path is isolated in its own component. Shared logic lives in custom hooks. Start with mobile path, then add desktop. |
| **Google Fonts (Inter Tight) impacts load time** | Load fonts via `<link>` in `index.html` with `font-display: swap` to prevent FOIT. Already a lightweight font (~40KB woff2). |
| **FoodArt CSS gradients replace real images** | This is by design for the Mesa aesthetic. Real images can be layered on top or replace FoodArt in a future iteration. |
| **32+ files changed = high risk of regressions** | Implement in 5 phases (Base → Landing → Auth → Cart → Profile). Each phase is independently testable via `openspec status` and manual verification. |
| **Existing specs have TBD purposes** | The modified capabilities in `frontend-auth-ui` and `customer-header` have TBD Purpose fields from previous archives. Update them during this change. |
