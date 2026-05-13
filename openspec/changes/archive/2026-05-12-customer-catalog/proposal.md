## Why

The FoodStore application currently has no customer-facing catalog experience. The HomePage is a placeholder with no product browsing, and the existing ProductCard and ProductDetail components are orphaned. Customers cannot browse available products, search by name, filter by category, or view product details — making the app unusable as a food delivery platform. Building a polished customer catalog is the highest-impact step toward a functional MVP.

## What Changes

- Build a **customer catalog landing page** replacing the HomePage placeholder, featuring category rails and a product grid
- Implement **product browsing** with search, category filtering, and pagination
- Build a **product detail page** at `/productos/:id` using the existing ProductDetail component
- Create a **navigation header** with the app logo, search bar, cart icon (with item count badge), and navigation links
- Wire up the existing **ProductCard** component to the product grid and data fetching hooks
- Reuse existing backend GET endpoints — no backend changes needed for read operations
- Add TanStack Query hooks for customer-facing product and category data fetching
- Ensure all components follow the Mesa Design System (food-ecommerce-ui skill patterns)

## Capabilities

### New Capabilities
- `customer-catalog-page`: Customer-facing product catalog with grid layout, search bar, category filter pills/rail, and pagination
- `customer-product-detail`: Product detail view showing full product info, ingredients, stock status, and add-to-cart action
- `customer-header`: Navigation header with logo, search input, navigation links, and cart icon with item count badge

### Modified Capabilities
- *(none — no existing spec requirements are changing)*

## Impact

- **Frontend**: `frontend/src/pages/HomePage.tsx` — complete rewrite into a catalog page; new page `ProductDetailPage.tsx`; new widget `Header.tsx` — rebuild from stub; `ProductGrid.tsx` — implement from stub; shared product hooks for customer use
- **Backend**: No changes — all required GET endpoints already exist
- **API Client**: Minor — may need to add any missing endpoint constants
- **Routing**: `/app/routes.tsx` — add `/productos/:id` route for product detail
