## 1. Backend — Connection Managers

- [x] 1.1 Create `backend/modules/pedidos/connection_manager.py` with `OrderSubscriptionManager` class (subscribe/unsubscribe/broadcast_to_order/disconnect por order_id)
- [x] 1.2 Add `admin_manager = WebSocketManager()` singleton import from `cocina/connection_manager` in the same file

## 2. Backend — WebSocket Endpoints

- [x] 2.1 Add `WS /{order_id}/events` endpoint in `pedidos/router.py` — JWT auth from query param, validates user owns order or is admin, subscribes via `OrderSubscriptionManager`
- [x] 2.2 Add `WS /events` endpoint in `admin/router.py` — JWT auth from query param, requires admin role, connects via `AdminEventManager`

## 3. Backend — Event Publishing

- [x] 3.1 Add `_publish_order_event()` method in `OrderService` — broadcasts status change to `OrderSubscriptionManager` for that order_id
- [x] 3.2 Add `_publish_admin_event()` method in `OrderService` — broadcasts status change to `AdminEventManager`
- [x] 3.3 Add `NUEVO_PEDIDO` broadcast in `OrderService.create_order()` — sends new order alert to `AdminEventManager`
- [x] 3.4 Wire both methods into `OrderService.update_status()` (alongside existing `_publish_kitchen_event()`)

## 4. Frontend — Cliente WebSocket Hook

- [x] 4.1 Create `frontend/src/features/orders/hooks/useOrderWS.ts` — connects to `WS /api/v1/pedidos/{orderId}/events`, exponential backoff reconnection, triggers refetch on `ORDER_STATUS_CHANGED`
- [x] 4.2 Integrate `useOrderWS(orderId)` into `OrderDetailPage.tsx` — connect on mount, disconnect on unmount; remove the manual MP polling loop (replace with WS-driven refetch)
- [x] 4.3 Integrate `useOrderWS(orderId)` into `AdminOrderDetailPage.tsx` — same pattern for admin detail view

## 5. Frontend — Admin WebSocket Hook + Alert

- [x] 5.1 Create `frontend/src/features/admin/orders/hooks/useAdminOrdersWS.ts` — connects to `WS /api/v1/admin/pedidos/events`, triggers list refetch on `ORDER_STATUS_CHANGED`, calls `onNewOrder` callback on `NUEVO_PEDIDO`
- [x] 5.2 Create `frontend/src/features/admin/orders/components/NewOrderAlert.tsx` — toast with icon, "¡Nuevo pedido!" text, total, item count, "Ver pedido" button, auto-close 8s
- [x] 5.3 Integrate `useAdminOrdersWS` + `NewOrderAlert` into `AdminPage` layout (available on all admin pages)

## 6. Verify

- [x] 6.1 Run backend tests — 160/160 passing, no regressions
- [ ] 6.2 Manually test: create order → verify client detail page auto-updates via WebSocket
- [ ] 6.3 Manually test: admin receives NUEVO_PEDIDO alert and ORDER_STATUS_CHANGED updates in orders table
