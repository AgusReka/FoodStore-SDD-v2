## Why

The app has a fully functional backend for orders (CRUD, status transitions, stock management) and a complete checkout flow that creates orders. However, customers have no way to view their order history or track individual order status after placing an order. The `/orders` page is a placeholder stub, `/orders/:id` doesn't exist (causing a 404 after checkout redirect), and the payment endpoints require admin-level permissions that block actual customer checkout.

## What Changes

- **New** customer order history page (`/orders`) with paginated list of past orders
- **New** customer order detail page (`/orders/:id`) with order info, items, status timeline, and payment info
- **New** TanStack Query hooks for fetching orders data
- **New** OrderCard, OrderList, OrderTimeline, and PaymentStatus UI components (replace stubs)
- **Fix** Payment endpoint permissions — allow authenticated customers to create payments (currently admin-only, which blocks checkout)
- **Fix** Backend `GET /pedidos/` — add `?estado=` status filter parameter (spec'd but not implemented)
- **Fix** Backend `GET /pagos/{id}` — allow customer to read their own payment

## Capabilities

### New Capabilities
- `customer-order-history`: Browsing paginated order history for the authenticated customer
- `customer-order-detail`: Viewing a single order with line items, status timeline, payment info, and delivery address

### Modified Capabilities
- `order-processing`: Add status filter support to `GET /pedidos/` endpoint; ensure `PedidoRead` response includes `payment` relation for customer viewing
- `payment-handling`: Change `POST /pagos/` permission from admin-only (`PAYMENT_CREATE`) to allow authenticated customers to create payments for their own orders; change `GET /pagos/{id}` to allow customers to read their own payment

## Impact

- **Backend**: `backend/modules/pedidos/router.py` — add status query param; `backend/modules/pedidos/service.py` — add status filter to `list_by_user`; `backend/modules/pagos/router.py` — change permission requirements; `backend/modules/pedidos/schemas.py` — add status filter schema
- **Frontend**: `frontend/src/pages/OrdersPage.tsx` — rewrite from stub; `frontend/src/pages/OrderDetailPage.tsx` — new page; `frontend/src/entities/order/` — implement stubs; `frontend/src/features/orders/` — implement stubs; `frontend/src/app/App.tsx` — add route; new query hooks
