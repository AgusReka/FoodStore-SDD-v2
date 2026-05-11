## Why

Products in Food Store need to declare their ingredients/composition so customers can see what they're ordering and admins can manage ingredient inventory. Currently there is no ingredient model or relation to products — ingredients must be tracked manually or not at all.

## What Changes

- Backend: New `ingredientes` module (model, schemas, repository, service, router) with full CRUD for ingredients
- Backend: New permissions (`INGREDIENT_CREATE`, `INGREDIENT_READ`, `INGREDIENT_UPDATE`, `INGREDIENT_DELETE`) with RBAC mappings for ADMIN
- Backend: Many-to-many relationship between `Product` and `Ingredient` via a junction table `producto_ingredientes` with quantity
- Backend: Ingredient CRUD endpoints at `/api/v1/ingredientes` (admin-protected)
- Frontend: New `entities/ingredient/` entity with TypeScript types and normalizer
- Frontend: New `features/admin/ingredients/` CRUD page (table, form, delete dialog)
- Frontend: Admin sidebar navigation updated with "Ingredientes" link
- Frontend: Routes updated with `/admin/ingredients`
- Database: Alembic migration for `ingredientes` and `producto_ingredientes` tables

## Capabilities

### New Capabilities
- `ingredient-management`: CRUD operations for ingredients, including listing, creating, editing, and deleting ingredients

### Modified Capabilities
- `product-catalog`: The Product model will gain a relationship to ingredients (many-to-many via junction table), requiring new scenarios for associating ingredients with products

## Impact

- **Backend**: New module `backend/modules/ingredientes/` (model, schemas, repository, service, router)
- **Backend**: Modified `backend/core/permissions.py` — add `INGREDIENT_*` permissions
- **Backend**: Modified `backend/modules/productos/model.py` — add many-to-many relationship to ingredients
- **Backend**: Modified `backend/main.py` — register new router
- **Frontend**: New `frontend/src/entities/ingredient/` entity
- **Frontend**: New `frontend/src/features/admin/ingredients/` CRUD feature
- **Frontend**: Modified `frontend/src/pages/AdminPage.tsx` — add nav link
- **Frontend**: Modified `frontend/src/app/App.tsx` — add route
- **Frontend**: Modified `frontend/src/shared/api/endpoints.ts` — add ingredient endpoints
- **Database**: New Alembic migration for `ingredientes` and `producto_ingredientes` tables
