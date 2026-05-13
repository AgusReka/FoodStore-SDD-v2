## Context

FoodStore is a food e-commerce app with a FastAPI backend and React frontend (FSD architecture). The backend fully supports all customer-facing read endpoints for products and categories (list with search/filter/pagination, detail with ingredients and stock). However, the frontend has no customer catalog experience:

- `HomePage` is a stub with a welcome message
- `ProductGrid` entity is a stub (1 line comment)
- `Header` widget is a stub (1 line comment)
- `ProductCard` and `ProductDetail` components exist and are fully functional but orphaned
- `Layout.tsx` renders only an `<Outlet />` — no header/nav wrapping pages

This change builds the customer-facing catalog layer entirely on the frontend, reusing existing backend endpoints and components.

## Goals / Non-Goals

**Goals:**
- Replace the HomePage stub with a full customer catalog page featuring: category filter rail, product grid with ProductCard, search bar, and pagination
- Build a product detail page at `/productos/:id` using the existing ProductDetail component
- Build a responsive Header widget with logo, search input, navigation links, and cart icon with badge
- Wire Layout.tsx to include the Header on customer-facing routes
- Create shared TanStack Query hooks for customer-facing product/category fetching (or extract from admin hooks)
- Implement `ProductGrid` component with responsive grid layout

**Non-Goals:**
- No backend changes — all needed GET endpoints already exist
- No admin panel changes
- No user authentication for browsing (catalog is public)
- No advanced filtering (price range, dietary filters) — future enhancement
- No product comparison or wishlist features

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Catalog page location** | Replace `HomePage.tsx` as the root route `/` | The catalog IS the home page for a food delivery app. No separate `/menu` or `/catalog` route needed. |
| **Data fetching hooks** | New customer-specific hooks in `features/catalog/hooks/` | Clean separation from admin hooks. Reuses the same `ENDPOINTS` and `queryKeys` but with customer-specific caching and error handling. |
| **Header integration** | Include Header inside `Layout.tsx` as a persistent wrapper | Every customer page needs the header with cart access. Wrapping at layout level avoids duplicating it per page. Admin pages may use a different layout later. |
| **Search UX** | In-page search bar (not a separate page) | Filtering products in real-time as user types provides better UX. Uses the existing backend `search` query param. Debounced at 300ms. |
| **Category filter** | Horizontal pill/rail above the product grid | Common food delivery pattern (Uber Eats, PedidosYa). Each pill filters products by category. "All" pill resets filter. |
| **Pagination** | "Show more" button at grid bottom vs numbered pages | Infinite scroll is more common in food delivery apps, but "Show more" gives users control. Will implement simple numbered pagination initially for consistency with admin patterns. |
| **Styling approach** | Mesa Design System via `food-ecommerce-ui` skill | Consistent with project's design language: warm orange brand, glassmorphism, Inter Tight font, Apple-inspired minimalism. |
| **Cart count in header** | Read from existing `cartStore` | Zustand store already has `items` array — derive count from `items.length`. No API call needed. |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| ProductCard and ProductDetail use blue buttons, but Mesa theme uses warm orange | Apply Mesa design tokens during implementation; the components exist but need styling updates to match brand |
| Debounced search on HomePage may cause confusion if results feel slow | Use 300ms debounce with visual loading indicator; show search results as user types with a "clear" button |
| No loading skeleton for product grid | Must build skeleton loading states as part of ProductGrid implementation — critical for perceived performance |
| Category filter may show empty categories | Query backend categories list (which only returns active categories with products) to avoid empty filters |
| Header may overlap with admin layout | Admin routes are under `/admin/*` which is a nested route — Layout.tsx wraps ALL routes, so admin will also get the header. That's acceptable initially; admin layout refinement is a separate concern. |
