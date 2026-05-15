# Tasks: Payment Info Display

## 1. Backend — Schema & Repository

- [x] 1.1 Add `payment: PagoRead | None = None` to `PedidoRead` in `backend/modules/pedidos/schemas.py`
- [x] 1.2 Add `selectinload(Order.payment)` to `get_with_items()` and `get_with_items_for_update()` in `backend/modules/pedidos/repository.py`

## 2. Frontend — Checkout Page

- [x] 2.1 In `CheckoutPage.tsx`, change the efectivo/transferencia navigate to include `&pending=true` query param

## 3. Frontend — Order Detail Page

- [x] 3.1 In `OrderDetailPage.tsx`, add a pending payment banner for efectivo/transferencia when `?pending=true` is present
- [x] 3.2 In `OrderDetailPage.tsx`, the existing `order.payment` conditional rendering will now work with real data
