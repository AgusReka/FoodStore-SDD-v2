## Why

**Two UX bugs** make it impossible for users and admins to identify and track orders correctly:

1. **Order ID mismatch**: Each view (mis pedidos, admin, cocina) displays a different portion of the UUID — mis pedidos shows the last 8 hex chars, admin/cocina show the first 8. The same order appears to have different IDs depending on where you look, causing constant confusion for users and staff.

2. **Missing product names**: In "Mis pedidos" and Admin order detail, only `product_id` (UUID) is shown instead of the actual product name (e.g. "Producto #ABC123" instead of "Hamburguesa Clásica"). Only the KDS (cocina) properly displays product names. This makes order review and support nearly impossible.

These are not feature gaps — they are bugs in the API schemas and frontend rendering that shipped with the original order management system.

## What Changes

- Add a **human-readable sequential order number** (`numero`) to the `Order` model and expose it consistently across all views (mis pedidos, admin, cocina)
- Fix `OrderItemRead` schema to include `product_name` so user-facing views show product names instead of raw UUIDs
- Update repository queries to eager-load the `Product` relationship for order items
- Update all frontend components to use `numero` instead of truncated `id` slices, and display `product_name` instead of `product_id`

## Capabilities

### New Capabilities
- *(none — this is a bugfix change, no new capabilities)*

### Modified Capabilities
- `order-management`: `PedidoRead` and `OrderItemRead` schemas change — `PedidoRead` gains `numero` (sequential order number), `OrderItemRead` gains `product_name`. Existing frontend components must update their field references.

## Impact

- **Backend**: Order model adds `numero` column (migration required); `OrderItemRead` schema adds `product_name`; `PedidoRead` adds `numero`; repository `get_with_items()` adds `selectinload(OrderItem.product)` for eager loading
- **Frontend**: All order-related components in mis pedidos (`OrderCard`, `OrderDetailPage`), admin (`OrdersTable`, `OrderDetailInfo`, `DashboardRecentOrders`), and cocina (`OrderCard`) need to update ID display to use `numero`; mis pedidos and admin detail need to render `product_name` instead of truncated `product_id`
- **Database**: New migration adds `numero` column to `pedidos` table (nullable initially, backfilled, then made non-nullable)
- **No breaking API changes**: `numero` and `product_name` are additive fields; cocina's `numero` was already declared in schema (previously always null)
