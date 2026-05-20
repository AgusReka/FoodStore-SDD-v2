# Proposal: Soft Delete for Products, Categories, and Ingredients

## Problem

Currently, deleting products, categories, and ingredients performs a **hard delete** (SQL `DELETE`), which causes:

1. **Loss of order history**: Deleting a product CASCADE-deletes `pedidos_items` rows, permanently destroying historical order data. Products can appear in orders but after deletion the data is gone.
2. **No audit trail**: There is no way to know what was deleted, when, or by whom.
3. **No recovery**: Deleted items cannot be restored.
4. **Misleading UI**: The product delete dialog warns that items with orders cannot be deleted, but the backend silently CASCADE-deletes them anyway.
5. **Product form bug**: The stock field (`stock_cantidad`) is not populated when editing a product, always showing empty.

## Solution

Replace hard deletes with **logical (soft) deletes** across products, categories, and ingredients, with the following behaviors:

### Products
- Soft-deleted products are **not visible** in the public catalog or product listings.
- Soft-deleted products **cannot be purchased** (add to cart / checkout blocks them).
- Soft-deleted products **remain visible** in order history — when a user views a past order containing a deleted product, the product name and details still display correctly.
- The `is_available` field controls display/purchase status independently from deletion.

### Categories
- Soft-deleted categories are hidden from category listings and product filters.
- Cannot delete a category that has active (non-deleted) products assigned to it.
- The existing `is_active` field is already present but not used for deletion — the new soft-delete mechanism will coexist with it.

### Ingredients
- Cannot delete an ingredient that is associated with any active product.
- Ingredients **cannot be "disabled"** — only deleted (soft delete with guard) or active. There is no equivalent to `is_available` for ingredients.

### Duplicate Names
- Soft-deleted instances do **not** block creation of new items with the same name.
- Uniqueness constraints apply only to active (non-deleted) items.
- After soft-delete, an admin can create a replacement with the same name (e.g., re-stock a discontinued product).

### Stock Form Fix
- Fix the product edit form so `stock_cantidad` is correctly populated when editing an existing product with simple stock (non-compound).

## Scope

### In scope
- Add `deleted_at: datetime | None` column to `productos`, `categorias`, `ingredientes` tables (Alembic migration)
- Update base repository to perform soft delete instead of hard delete
- Update all read queries to filter `deleted_at IS NULL` by default
- Update product, category, and ingredient delete endpoints to soft-delete
- Update order detail queries to include soft-deleted products (no filter on `deleted_at`)
- Add guard: cannot soft-delete category with active products
- Add guard: cannot soft-delete ingredient with active products
- Fix product form `stock_cantidad` not populating on edit
- Update frontend delete dialogs to reflect soft-delete behavior
- Update frontend product listing/form to handle deleted items correctly

### Out of scope
- Admin UI to list/restore soft-deleted items (future change)
- Audit logging (who deleted, when — `deleted_at` timestamp is sufficient for now)
- Hard delete endpoint for permanent removal (future change if needed)

## Impact

| Area | Impact |
|------|--------|
| Database | New `deleted_at` columns on 3 tables |
| Backend API | Delete endpoints change behavior; read endpoints filter by `deleted_at` |
| Frontend | Delete dialogs updated; stock form bug fixed |
| Orders | Order history preserved with soft-deleted products |
| Data integrity | CASCADE on `pedidos_items.product_id` changed to prevent data loss |
