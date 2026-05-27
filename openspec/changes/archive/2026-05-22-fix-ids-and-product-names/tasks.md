## 1. Database Migration

- [x] 1.1 Create Alembic migration that adds `numero` column to `pedidos` table (nullable, with sequence for auto-generation)
- [x] 1.2 Add `numero` column to Order model in `backend/modules/pedidos/model.py`

## 2. Backend Schemas & Repository

- [x] 2.1 Add `product_name: str` to `OrderItemRead` in `backend/modules/pedidos/schemas.py`
- [x] 2.2 Add `numero: int | None = None` to `PedidoRead` in `backend/modules/pedidos/schemas.py`
- [x] 2.3 Update `PedidoRepository.get_with_items()` to add `selectinload(OrderItem.product)`
- [x] 2.4 Update `PedidoRepository.get_by_user()` and `get_by_status()` to add `selectinload(OrderItem.product)`
- [x] 2.5 Generate `numero` on order creation in `OrderService.create_order()` (populate from DB sequence)

## 3. Frontend — Mis Pedidos

- [x] 3.1 Update `OrderCard.tsx`: replace `order.id.slice(-8).toUpperCase()` with `order.numero`
- [x] 3.2 Update `OrderDetailPage.tsx`: replace `order.id.slice(-8)` with `order.numero` in header; replace `product_id.slice(-6)` with `item.product_name` in product list
- [x] 3.3 Update TypeScript `OrderRead` and `OrderItemRead` types in `useOrders.ts` to include `numero` and `product_name`

## 4. Frontend — Admin

- [x] 4.1 Update `OrdersTable.tsx`: replace `order.id.slice(0, 8)` with `order.numero`
- [x] 4.2 Update `OrderDetailInfo.tsx`: replace `order.id.slice(0, 8)` with `order.numero`; replace `item.product_id.slice(0, 8)` with `item.product_name`
- [x] 4.3 Update `DashboardRecentOrders.tsx`: replace `order.id.slice(0, 8)` with `order.numero`
- [x] 4.4 Update TypeScript `OrderRead` and `OrderItemRead` types in `useAdminOrders.ts` to include `numero` and `product_name`

## 5. Verify

- [x] 5.1 Run backend tests to verify schema and repository changes don't break existing tests
- [ ] 5.2 Run migration against local DB and verify `numero` is populated correctly
