## Why

The product catalog backend API is fully implemented, but there is no admin interface to manage products. Admins currently cannot create, edit, list, or delete products through the UI — they rely on the `admin-categories` and `admin-ingredients` features for related entities but lack product management entirely. This change fills that gap by providing a complete admin CRUD UI for products, following the same patterns as the existing categories and ingredients admin pages.

## What Changes

- **New Product entity types** in `entities/product/index.ts` — TypeScript types and a normalizer function (following the pattern of `entities/category/index.ts`)
- **New admin Products page** at `features/admin/products/` — with list, create, edit, and delete functionality
- **New hooks** for product queries and mutations using TanStack Query
- **New components**: `ProductTable`, `ProductForm`, `DeleteProductDialog`
- **Route wiring**: Add `/admin/products` route in `App.tsx` and sidebar link in `AdminPage.tsx`
- **Modal-based CRUD** flow consistent with existing categories and ingredients pages
- **Product form** includes: name, description, price, currency, image URL, availability toggle, category selector (dropdown from Categories API), and ingredient associations (multi-select with quantity per ingredient)
- **Product table** shows: name, price, category, availability status, and action buttons
- **Product deletion** includes confirmation dialog and handles 409 conflict if product has associated orders

## Capabilities

### New Capabilities
- `admin-products`: Admin CRUD interface for managing the product catalog — listing, creating, editing, and deleting products with support for category assignment and ingredient association

### Modified Capabilities
- `product-catalog`: Product entity types and frontend client hooks will be added; no changes to backend API requirements

## Impact

- **Frontend**: New files under `entities/product/`, `features/admin/products/`, route modification in `app/App.tsx`, sidebar update in `pages/AdminPage.tsx`
- **Backend**: No backend changes required — the existing `productos` API fully supports all CRUD operations, pagination, search, category filtering, and ingredient associations
- **Shared API**: No new endpoints needed — `ENDPOINTS.PRODUCTS_LIST` and `ENDPOINTS.PRODUCTS_DETAIL` already exist
