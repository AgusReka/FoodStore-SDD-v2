## Context

The FoodStore backend already has a complete `productos` module with model, schemas, repository, service, and router supporting full CRUD, pagination, search, category filtering, and ingredient associations. The frontend has:

- **Existing pattern**: Admin CRUD pages for categories and ingredients using TanStack Query + Modal-based forms
- **Product entity file**: Exists at `entities/product/index.ts` but is **empty** — no types defined
- **API endpoints**: `ENDPOINTS.PRODUCTS_LIST` and `ENDPOINTS.PRODUCTS_DETAIL` already configured
- **Routing**: Admin layout with sidebar navigation (`AdminPage.tsx`) and route definitions in `App.tsx`
- **Shared components**: Modal, Button, Input, Pagination, Skeleton — all available

The gap is the admin products page itself and the supporting frontend types, hooks, and components.

## Goals / Non-Goals

**Goals:**
- Define Product entity types (TypeScript interfaces + normalizer) in `entities/product/index.ts`
- Create TanStack Query hooks for product CRUD in `features/admin/products/hooks/useProducts.ts`
- Build admin product listing page with pagination, search, and category filter
- Build create/edit product form with category selector and ingredient association
- Build delete product confirmation dialog with conflict handling (409 for products with orders)
- Wire route and sidebar navigation
- Follow the exact same UI patterns as the existing `features/admin/categories/` and `features/admin/ingredients/`

**Non-Goals:**
- Backend changes (API is complete)
- Image upload functionality (handled via URL string field)
- Bulk product operations
- Product stock/quantity tracking in admin UI
- Public-facing product catalog UI improvements
- Product variant management

## Decisions

### 1. Follow existing admin CRUD pattern (Modal-based, not separate pages)

**Decision**: Use modal dialogs for create/edit/delete instead of dedicated route pages.

**Rationale**: Matches the established pattern in `categories/` and `ingredients/`. Keeps the UI simple and consistent. The product form is more complex (ingredients, category) but still fits a single scrollable modal with size `lg`.

**Alternatives considered**: Separate route pages (`/admin/products/new`, `/admin/products/:id/edit`) — rejected because it breaks consistency with existing admin patterns and adds unnecessary navigation complexity.

### 2. Normalize ingredient association inline in the product form

**Decision**: The product form will include an ingredient selector that fetches the ingredients list and lets the user pick ingredients with quantities. Ingredient data is passed as `ProductIngredientCreate[]` in the API payload.

**Rationale**: The backend already accepts `ingredientes: [{ ingredient_id, quantity }]` in the product create/update schemas. No separate ingredient-management UI is needed within the product form.

### 3. Category selector as a dropdown that fetches categories

**Decision**: The product form includes a category dropdown that fetches the full categories list (no pagination — categories are few).

**Rationale**: The existing categories API supports listing all categories. A small enough set to load once and cache client-side.

### 4. Reuse existing shared components (Modal, Button, Input, Pagination, Skeleton)

**Decision**: No new generic shared components. All UI composed from existing shared components.

**Rationale**: The existing shared component library covers all needs. Consistency over custom styling.

### 5. Endpoint structure

**Decision**: Use the existing `ENDPOINTS.PRODUCTS_LIST` (for GET list + POST create) and `ENDPOINTS.PRODUCTS_DETAIL` (for GET detail + PATCH update + DELETE).

**Rationale**: Backend routes are already mapped. The `client.ts` utility (get/post/patch/del) wraps axios and handles auth headers automatically.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Product form is complex (ingredients section, category selector) and could become unwieldy in a modal | Use `lg` modal size; group form sections visually (basic info → category → ingredients → availability) |
| Ingredients list could be large, making the dropdown slow | Load all ingredients upfront (they are few in a food store); cache with TanStack Query |
| Deleting a product that has associated orders returns 409 | Handle 409 in the delete dialog (same pattern as categories delete conflict) |
| The product entity file is currently empty — might need to check for existing usages | Search codebase for any imports of `@entities/product` before writing to avoid breaking existing code |

## Open Questions

- Does the product form need a stock/quantity field? The current `Product` model does not have explicit stock tracking — availability is a boolean flag. Stock management may be a future concern.
- Is image upload (file upload + server storage) planned, or is the URL field sufficient? Currently implemented as a URL string only.
