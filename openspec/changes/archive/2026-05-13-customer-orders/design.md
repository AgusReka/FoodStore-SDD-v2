## Context

The app already has a complete backend for order processing (CRUD, status machine, stock management) and payment handling. The checkout flow creates orders and payments, then redirects to `/orders/{id}` — which doesn't exist. The frontend has stubs for order-related components (OrderCard, OrderList, OrderTimeline, PaymentStatus, OrdersPage) that need to be implemented. Additionally, two backend issues need fixing: payment endpoints require admin permissions (blocking customer checkout), and the list endpoint lacks the spec'd status filter.

## Goals / Non-Goals

**Goals:**
- Implement customer order history page (`/orders`) with paginated list and status filtering
- Implement customer order detail page (`/orders/:id`) with full order info, timeline, payment details
- Build reusable order UI components (OrderCard, OrderList, OrderTimeline, PaymentStatus)
- Create TanStack Query hooks for orders data fetching
- Fix payment API permissions to allow customers to create payments for their own orders
- Fix backend list endpoint to support `?estado=` status filter
- Register `/orders/:id` route in App.tsx

**Non-Goals:**
- Admin order management page (separate change)
- Backend tests (out of scope — focus on frontend + minimal backend fixes)
- Order cancellation from frontend (backend supports it, but no UI yet)
- Real payment gateway integration (already deferred — using manual payment methods)
- Push notifications or real-time status updates

## Decisions

### 1. Self-contained order query hooks vs. extending generic fetcher
**Decision:** Create dedicated `useOrders` hooks using TanStack Query.
**Rationale:** The existing pattern in the app uses per-feature hooks (e.g., `useProducts` in catalog). Following the same pattern is more maintainable than a generic approach. The hooks will use `apiClient.get()` from the existing axios wrapper.

### 2. Order detail fetches address from included relation
**Decision:** The backend `PedidoRead` already returns `address_id`. The frontend will fetch address details via existing `GET /api/v1/direcciones` endpoint. For the MVP, we'll display address_id and let the order detail include a link to basic address info. If full address data is needed, the backend `PedidoRead` response would need an `address` relation — this is a future improvement.

### 3. Payment permission fix approach
**Decision:** Change payment endpoints from `require_permission(Permission.PAYMENT_CREATE/READ)` to `Depends(get_current_user)` with an ownership check. The service layer will verify `order.user_id == current_user.id` for customer requests. Admin permissions remain available for a separate admin flow.
**Rationale:** Minimal change that unblocks the customer flow without breaking admin access patterns.

### 4. Status timeline as visual step indicator
**Decision:** Build a horizontal step indicator showing all order statuses as steps, with filled/active/future states. Use the `OrderStatus` enum ordering to determine progress.
**Rationale:** Clear visual feedback for the customer is more intuitive than a text-based status. This is the standard pattern in food delivery apps (Uber Eats, PedidosYa).

### 5. Status filter as tabs vs. dropdown
**Decision:** Use horizontal filter tabs on the order history page.
**Rationale:** Matches the existing Mesa design patterns (CategoryRail uses similar pill UI). Tabs are immediately visible vs. a dropdown that requires an extra click.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Payment POST permission change could introduce security gap | Add ownership verification in service layer — users can only create payments for their own orders |
| `PedidoRead` doesn't include full address or payment objects — detail page may have limited info | Backend `Order` model has `payment` relationship eager-loaded. Address is available as `address_id`. Full address data can be fetched separately or added in a follow-up |
| Status filter could be slow on large datasets | Backend already has `ix_pedidos_estado` and `ix_pedidos_user_id` indexes, combined query should be efficient |
| `total` in `list_by_user` is inaccurate (uses `len(items)` rather than counting filtered rows) | Existing bug — the current implementation uses `len(items)` which only works for the first page. Fix as part of this change by adding a proper count query |
