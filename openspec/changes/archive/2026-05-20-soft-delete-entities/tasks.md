# Tasks: Soft Delete for Products, Categories, and Ingredients

## 1. Database Migration — Add `deleted_at` columns

- [x] 1.1 Create Alembic migration to add `deleted_at TIMESTAMPTZ DEFAULT NULL` to `productos`, `categorias`, `ingredientes`
- [x] 1.2 Add partial indexes for active items (`WHERE deleted_at IS NULL`) on each table
- [x] 1.3 Change `pedidos_items.product_id` FK from `ON DELETE CASCADE` to `ON DELETE NO ACTION` (drop and recreate constraint)
- [ ] 1.4 Run `alembic upgrade head` and verify migration applies cleanly

## 2. Model Layer — Add `deleted_at` field

- [x] 2.1 Add `deleted_at: Mapped[datetime | None]` to `Product` model (`backend/modules/productos/model.py`)
- [x] 2.2 Add `deleted_at: Mapped[datetime | None]` to `Category` model (`backend/modules/categorias/model.py`)
- [x] 2.3 Add `deleted_at: Mapped[datetime | None]` to `Ingredient` model (`backend/modules/ingredientes/model.py`)

## 3. Repository Layer — Soft delete + active filter

- [x] 3.1 Override `BaseRepository.delete()` to set `deleted_at = now()` instead of SQL DELETE (fallback to hard delete if model lacks `deleted_at`)
- [x] 3.2 Add `_active_filter()` helper to filter `deleted_at IS NULL` on models that support soft delete
- [x] 3.3 Update `ProductRepository.list()` / `get_all()` to apply `_active_filter()`
- [x] 3.4 Update `CategoryRepository.list()` / `get_all()` to apply `_active_filter()`
- [x] 3.5 Update `IngredientRepository.list()` / `get_all()` to apply `_active_filter()`
- [x] 3.6 Update `has_products()` checks in Category and Ingredient repos to `has_active_products()` (filter by `deleted_at IS NULL`)
- [x] 3.7 Verify order detail queries do NOT apply `_active_filter()` on products — order history must include soft-deleted products

## 4. Service Layer — Update delete guards

- [x] 4.1 Update `CategoriaService.delete_categoria()` to use `has_active_products()` guard
- [x] 4.2 Update `IngredientService.delete_ingredient()` to use `has_active_products()` guard
- [x] 4.3 Remove any remaining hard-delete references from service layer

## 5. Schemas — Update Pydantic models

- [x] 5.1 Add `deleted_at: datetime | None` to Product response schemas
- [x] 5.2 Add `deleted_at: datetime | None` to Category response schemas
- [x] 5.3 Add `deleted_at: datetime | None` to Ingredient response schemas
- [x] 5.4 Verify no `deleted_at` in create/update DTOs (admin should not manually set it)

## 6. Frontend — Fix product form stock bug

- [x] 6.1 Add `stock_cantidad: product.stockCantidad` to `openEditModal()` in `frontend/src/features/admin/products/index.tsx`
- [x] 6.2 Add `stock_cantidad` to `emptyFormData` for consistency in create flow
- [x] 6.3 Verify stock field displays correctly when editing a product with existing stock

## 7. Frontend — Update delete dialogs

- [x] 7.1 Update `DeleteProductDialog.tsx` warning text: remove "no se puede eliminar con pedidos" message, add soft-delete explanation
- [x] 7.2 Remove 409 conflict error handling from product delete flow (products can always be soft-deleted)
- [x] 7.3 Update `DeleteCategoryDialog.tsx` warning text for soft-delete behavior
- [x] 7.4 Update `DeleteIngredientDialog.tsx` warning text for soft-delete behavior
- [x] 7.5 Keep 409 conflict handling in category and ingredient dialogs (still blocked when associated with active products)

## 8. Frontend — TypeScript types

- [x] 8.1 Add `deletedAt: string | null` to Product entity type
- [x] 8.2 Add `deletedAt: string | null` to Category entity type
- [x] 8.3 Add `deletedAt: string | null` to Ingredient entity type

## 9. Integration testing

- [ ] 9.1 Test: Soft-deleted product does not appear in catalog or admin product list
- [ ] 9.2 Test: Soft-deleted product still appears in order detail/history
- [ ] 9.3 Test: Cannot add soft-deleted product to cart
- [ ] 9.4 Test: Cannot delete category with active products (409 returned)
- [ ] 9.5 Test: Cannot delete ingredient used in active products (409 returned)
- [ ] 9.6 Test: Can create new product with same name as a soft-deleted product
- [ ] 9.7 Test: Product edit form shows correct stock_cantidad value
- [ ] 9.8 Test: alembic migration applies and rolls back cleanly
