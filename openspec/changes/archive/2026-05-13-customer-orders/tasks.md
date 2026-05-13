## 1. Backend Fixes

- [x] 1.1 Add `estado` query parameter to `GET /api/v1/pedidos/` — filter orders by status in both router and service
- [x] 1.2 Fix `total` count in `list_my_orders` — use proper filtered count query instead of `len(items)` to support accurate pagination
- [x] 1.3 Change `POST /api/v1/pagos/` permission from `PAYMENT_CREATE` (admin) to authenticated user with ownership check — customers can create payments for their own orders
- [x] 1.4 Change `GET /api/v1/pagos/{id}` permission from `PAYMENT_READ` (admin) to authenticated user with ownership check — customers can view their own payment

## 2. Frontend Infrastructure

- [x] 2.1 Create TanStack Query hooks: `useOrdersList(filters?)` and `useOrderDetail(orderId)` in `features/orders/hooks/`
- [x] 2.2 Ensure API client supports orders and payments endpoints (verify existing axios wrapper covers pagos/ and pedidos/ paths)

## 3. Order Entity Components

- [x] 3.1 Implement `OrderCard` component — displays order summary (ID, status badge, total, date, item count) with click navigation to detail
- [x] 3.2 Implement `OrderList` component — renders list of OrderCards with pagination controls (Anterior/Siguiente buttons)
- [x] 3.3 Update `entities/order/index.ts` barrel exports

## 4. Order Feature Components

- [x] 4.1 Implement `OrderTimeline` component — horizontal step indicator showing order status progress (pendiente → confirmado → preparando → enviado → entregado) with active/completed/pending states
- [x] 4.2 Implement `PaymentStatus` component — badge/chip displaying payment method icon and payment status with color-coded styling
- [x] 4.3 Update `features/orders/index.ts` barrel exports

## 5. Customer Pages

- [x] 5.1 Implement `OrdersPage` — full order history with: status filter tabs, paginated list, loading skeleton, empty state ("No tenés pedidos todavía"), error state with retry
- [x] 5.2 Implement `OrderDetailPage` — full order detail with: success banner for post-checkout, order info, line items table, status timeline, payment info, delivery address, loading/error/not-found states
- [x] 5.3 Register `/orders/:id` route in `App.tsx` inside the existing ProtectedRoute wrapper
- [x] 5.4 Verify CheckoutPage post-checkout redirect — ensure navigation to `/orders/${order.id}` works correctly after order + payment creation
