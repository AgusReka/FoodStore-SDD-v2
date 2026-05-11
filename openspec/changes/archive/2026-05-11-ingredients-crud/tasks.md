## 1. Database & Backend Foundation

- [x] 1.1 Create Alembic migration for `ingredientes` table and `producto_ingredientes` junction table
- [x] 1.2 Add `INGREDIENT_*` permissions to `backend/core/permissions.py` and ADMIN role mapping
- [x] 1.3 Register ingredient models in `backend/main.py` (model import) and include router

## 2. Backend Ingredient Module

- [x] 2.1 Create `backend/modules/ingredientes/model.py` — Ingredient SQLAlchemy model with unique name constraint
- [x] 2.2 Create `backend/modules/ingredientes/schemas.py` — Create, Update, Read, List schemas
- [x] 2.3 Create `backend/modules/ingredientes/repository.py` — CRUD operations with search and pagination
- [x] 2.4 Create `backend/modules/ingredientes/service.py` — Business logic with duplicate check and product-reference check on delete
- [x] 2.5 Create `backend/modules/ingredientes/router.py` — All CRUD endpoints with permission guards

## 3. Product-Ingredient Relationship

- [x] 3.1 Add `ProductIngredient` junction model in `backend/modules/ingredientes/model.py`
- [x] 3.2 Update `Product` model with `ingredients` relationship (many-to-many through junction)
- [x] 3.3 Update product schemas (`ProductCreate`, `ProductUpdate`, `ProductRead`) with optional `ingredientes` field
- [x] 3.4 Update product service to handle ingredient associations on create/update
- [x] 3.5 Update product repository if needed for ingredient join queries

## 4. Frontend Entity & API

- [x] 4.1 Create `frontend/src/entities/ingredient/index.ts` with TypeScript types and normalizer
- [x] 4.2 Add ingredient endpoints to `frontend/src/shared/api/endpoints.ts`

## 5. Frontend Admin CRUD

- [x] 5.1 Create `frontend/src/features/admin/ingredients/hooks/useIngredients.ts` — TanStack Query hooks (list, detail, create, update, delete)
- [x] 5.2 Create `frontend/src/features/admin/ingredients/components/IngredientTable.tsx` — Table with pagination
- [x] 5.3 Create `frontend/src/features/admin/ingredients/components/IngredientForm.tsx` — Create/edit form modal
- [x] 5.4 Create `frontend/src/features/admin/ingredients/components/DeleteIngredientDialog.tsx` — Delete confirmation with conflict handling
- [x] 5.5 Create `frontend/src/features/admin/ingredients/index.tsx` — Main CRUD page orchestrating modals and table

## 6. Frontend Integration

- [x] 6.1 Add `/admin/ingredients` route to `frontend/src/app/App.tsx`
- [x] 6.2 Add "Ingredientes" nav link to `frontend/src/pages/AdminPage.tsx`
