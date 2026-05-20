# Design: Soft Delete for Products, Categories, and Ingredients

## Architecture Overview

Implement soft delete at three layers: **database**, **repository**, and **API**, with a frontend fix for the product form stock field.

## Database Changes

### New Migration

Add `deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL` to three tables:

```sql
ALTER TABLE productos ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE categorias ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE ingredientes ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
```

**Index strategy**: Partial indexes for active items to optimize the common query pattern:

```sql
CREATE INDEX idx_productos_active ON productos (id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categorias_active ON categorias (id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ingredientes_active ON ingredientes (id) WHERE deleted_at IS NULL;
```

### Cascade Constraint Change

The `pedidos_items.product_id` foreign key currently uses `ON DELETE CASCADE`. This must be changed to `ON DELETE NO ACTION` (or `RESTRICT`) to prevent order history destruction. Since soft delete replaces the actual DELETE, the CASCADE won't fire for soft-deleted products, but the constraint should still be corrected as a safety measure.

**Migration approach**: Drop the existing FK and recreate with `ON DELETE NO ACTION`.

### Model Changes

**`backend/modules/productos/model.py`**:
```python
deleted_at: Mapped[datetime | None] = mapped_column(
    "deleted_at", DateTime(timezone=True), nullable=True, default=None
)
```

**`backend/modules/categorias/model.py`**:
```python
deleted_at: Mapped[datetime | None] = mapped_column(
    "deleted_at", DateTime(timezone=True), nullable=True, default=None
)
```

**`backend/modules/ingredientes/model.py`**:
```python
deleted_at: Mapped[datetime | None] = mapped_column(
    "deleted_at", DateTime(timezone=True), nullable=True, default=None
)
```

## Repository Layer

### BaseRepository Modification

Override the `delete()` method to perform soft delete instead of hard delete:

```python
async def delete(self, id: UUID) -> bool:
    instance = await self.get(id)
    if not instance:
        return False
    if hasattr(instance, "deleted_at"):
        instance.deleted_at = datetime.now(timezone.utc)
        await self.session.commit()
        return True
    await self.session.delete(instance)
    await self.session.commit()
    return True
```

### Active-only Query Filter

Add a method to all list/get queries that filters out soft-deleted items:

```python
def _active_filter(self, stmt: Select) -> Select:
    """Add WHERE deleted_at IS NULL if the model supports soft delete."""
    model = self.model
    if hasattr(model, "deleted_at"):
        return stmt.where(model.deleted_at.is_(None))
    return stmt
```

Apply `_active_filter()` to:
- `list()` / `get_all()` methods
- `get_by_id()` methods (public-facing)
- Catalog queries, product listings, category dropdowns, ingredient selectors

### Order Queries Exception

Order detail queries must **NOT** filter by `deleted_at` on products. When fetching an order with its items, soft-deleted products must still be returned so the order history is complete.

## Service Layer

### Product Delete

Current: calls `service.delete(product_id)` → hard delete.
New: same call, but repository performs soft delete.

No additional guard needed — soft delete preserves order history.

### Category Delete

Current: checks `has_products()` → hard delete if no products.
New: check `has_active_products()` (products where `deleted_at IS NULL`).

```python
async def delete_categoria(self, categoria_id: UUID) -> bool:
    has_active_products = await self.repository.has_active_products(categoria_id)
    if has_active_products:
        raise ConflictError("Cannot delete category with active products")
    return await self.repository.delete(categoria_id)
```

**Clarification on "category in ingredient"**: There is NO direct FK between categories and ingredients. The relationship is `Category → Product → Ingredient`. The guard "cannot delete category with active products" already covers this indirectly — if a category has products (which may have ingredients), deletion is blocked.

### Ingredient Delete

Current: checks `has_products()` → hard delete if no products.
New: check `has_active_products()` (products where `deleted_at IS NULL`).

```python
async def delete_ingredient(self, ingredient_id: UUID) -> bool:
    ingredient = await self.repository.get(ingredient_id)
    if not ingredient:
        raise NotFoundError("Ingredient not found")
    has_active_products = await self.repository.has_active_products(ingredient_id)
    if has_active_products:
        raise ConflictError("Cannot delete ingredient used in active products")
    return await self.repository.delete(ingredient_id)
```

### Duplicate Name Handling

Uniqueness constraints should be **partial unique indexes** that only apply to active items:

```sql
-- Drop existing unique constraints if they exist, recreate as partial:
CREATE UNIQUE INDEX idx_productos_name_unique ON productos (name) 
  WHERE deleted_at IS NULL;
```

If no unique constraints exist currently (which appears to be the case), no migration is needed — soft-deleted items won't conflict with new items because all queries filter by `deleted_at IS NULL`.

## API Layer

### Endpoints — No Route Changes

The existing DELETE endpoints remain the same:
- `DELETE /api/v1/productos/{product_id}`
- `DELETE /api/v1/categorias/{categoria_id}`
- `DELETE /api/v1/ingredientes/{ingredient_id}`

Behavior changes from hard delete to soft delete. Response remains `204 NO_CONTENT`.

### Public Read Endpoints

All public read endpoints automatically filter `deleted_at IS NULL` through the repository layer. No router changes needed.

### Admin Read Endpoints

Admin endpoints should also filter by `deleted_at IS NULL` by default. Optionally, a future `?include_deleted=true` query param could expose deleted items for an admin "recycle bin" view (out of scope for this change).

## Frontend Changes

### Product Form Stock Fix

**Bug**: `openEditModal` in `frontend/src/features/admin/products/index.tsx` does not include `stock_cantidad` when populating `formData` for editing.

**Fix**: Add `stock_cantidad: product.stockCantidad` to the `setFormData()` call in `openEditModal` (lines 132-149).

Also add `stock_cantidad` to `emptyFormData` for consistency.

### Delete Dialog Updates

**Product Delete Dialog** (`DeleteProductDialog.tsx`):
- Change warning text from "Si el producto tiene pedidos asociados, no se podra eliminar" to "El producto sera ocultado del catalogo y no se podra comprar. Los pedidos existentes conservaran su informacion."
- Remove conflict error handling for 409 (products can always be soft-deleted now).

**Category Delete Dialog** (`DeleteCategoryDialog.tsx`):
- Update warning text to mention soft-delete behavior.
- Keep 409 conflict handling for "active products" scenario.

**Ingredient Delete Dialog** (`DeleteIngredientDialog.tsx`):
- Update warning text to mention soft-delete behavior.
- Keep 409 conflict handling for "used in active products" scenario.

### Delete Hook Updates

The `useDeleteProduct` mutation no longer needs to handle 409 conflicts since products can always be soft-deleted. The category and ingredient hooks keep their 409 handling.

## Security & Permissions

No changes to permission model. The same `Permission.PRODUCT_DELETE`, `Permission.CATEGORY_DELETE`, `Permission.INGREDIENT_DELETE` guards remain in place.

## Testing Strategy

1. **Backend unit tests**: Verify soft-delete sets `deleted_at` instead of deleting row
2. **Backend integration tests**: Verify deleted items don't appear in listings
3. **Order integrity test**: Verify order details still show soft-deleted products
4. **Guard tests**: Verify category/ingredient deletion blocked when associated with active products
5. **Duplicate name test**: Verify new item with same name as deleted item can be created
6. **Frontend test**: Verify stock field populates correctly on product edit
7. **Frontend test**: Verify delete dialog shows correct warning text
