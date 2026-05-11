## Why

The backend CRUD API for categories (`/api/v1/categorias/`) is fully implemented — including model, schemas, repository, service, router, permissions, DB migration, and seed data. However, there is no frontend admin interface to manage categories. Admins need a UI to create, list, edit, and delete categories as part of the broader admin panel.

## What Changes

- Create a Category entity in the frontend (`entities/category/`) with TypeScript types and API hooks
- Create an admin categories feature (`features/admin/categories/`) with:
  - Category list page (table with pagination)
  - Create category form (modal or page)
  - Edit category form
  - Delete category with conflict handling (show warning if products are associated)
- Add admin sub-routing for the categories management page
- No backend changes required — all API endpoints already exist

## Capabilities

### New Capabilities
- `admin-categories`: Administrative frontend UI for managing product categories — list, create, edit, and delete categories through the admin panel.

### Modified Capabilities
- *(No existing specs need requirement changes. The `product-catalog` spec already covers backend Category CRUD, and no backend API changes are needed.)*

## Impact

- **Frontend**: New files under `entities/category/` and `features/admin/categories/`; updates to `pages/admin/` and `App.tsx` for routing
- **Backend**: No changes required
- **Dependencies**: Existing shared components (`Button`, `Input`, `Modal`, `Skeleton`, `DataTable`) and API client endpoints (`CATEGORIES_LIST`, `CATEGORIES_DETAIL`)
