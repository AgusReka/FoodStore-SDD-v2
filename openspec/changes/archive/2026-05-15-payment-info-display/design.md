# Design: Payment Info Display

## Context

The current payment system stores payment method and status correctly in the `pagos` table, but this data is never exposed to the frontend. The `PedidoRead` Pydantic schema that serializes order responses does not include the `payment` relationship, so both client and admin dashboards always show "Información de pago no disponible".

Additionally, when a user pays with Efectivo or Transferencia Bancaria, they are redirected to the order detail page with a generic "¡Pedido confirmado!" banner, even though the payment is still pending admin confirmation. This is misleading.

## Goals / Non-Goals

**Goals:**
- Expose payment method and status in all order API responses (detail + list)
- Client order detail: show payment method, status, and amount for all 3 methods
- Client order detail: show a specific "pending payment" banner for Efectivo/Transferencia
- Admin order detail: show payment method, status, amount for all methods
- MP: show payment success/failure status correctly

**Non-Goals:**
- No changes to the payment processing logic
- No new endpoints
- No changes to the CheckoutPage or the order creation flow
- No changes to the admin order list table (only detail page)

## Decisions

### Decision 1: Add `payment` field directly to `PedidoRead`

**Chosen:** Add `payment: PagoRead | None = None` to the existing `PedidoRead` schema.

**Alternatives considered:**
- Create a new `PedidoWithPaymentRead` schema — rejected because it would require changing the response_model on every endpoint
- Add payment to a separate endpoint — rejected because the frontend already expects it in the order response

**Rationale:** The `Order` model already has `lazy="selectin"` on the `payment` relationship, so SQLAlchemy automatically loads it. The only missing piece is the schema field. Adding it to `PedidoRead` requires no new endpoints or query changes.

### Decision 2: Use query param `?pending=true` for Efectivo/Transferencia

**Chosen:** Pass `?pending=true` in the redirect URL when placing an Efectivo/Transferencia order.

**Rationale:** The existing `?new=true` param is already used to show the success banner for MP orders. We need a way to distinguish Efectivo/Transferencia (pending payment) from MP (immediately confirmed by webhook). A query param is the simplest approach — no store changes needed.

### Decision 3: No circular import risk

`pedidos/schemas.py` will import `PagoRead` from `pagos/schemas.py`. This is safe because `pagos/schemas.py` only imports from `backend.core.enums` — no reverse dependency exists.

## Components

### Backend: `backend/modules/pedidos/schemas.py`
- **Change**: Add `from backend.modules.pagos.schemas import PagoRead`
- **Change**: Add `payment: PagoRead | None = None` to `PedidoRead`
- **Impact**: Every endpoint using `PedidoRead` as `response_model` will now include payment data

### Backend: `backend/modules/pedidos/repository.py`
- **Change**: Add `selectinload(Order.payment)` to `get_with_items()` and `get_with_items_for_update()`
- **Reason**: Eager-load payment alongside items for efficiency
- **Note**: Not strictly required (lazy="selectin" already works), but best practice for explicit loading

### Frontend: `CheckoutPage.tsx`
- **Change**: Efectivo/Transferencia navigate → add `&pending=true` to URL
- **Lines affected**: ~222 (`navigate` call in `handleConfirmOrder`)

### Frontend: `OrderDetailPage.tsx`
- **Change**: Add a new "Pago pendiente" banner for Efectivo/Transferencia
- **Change**: The existing `{order.payment ? ...}` block will now render correctly with real data
- **Logic**: If `searchParams.has('pending')` AND payment status is `pendiente` → show pending banner
- **Lines affected**: ~266-330 (banner area), ~625-689 (payment info)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Circular import between pedidos↔pagos schemas | Confirmed none exists — pagos/schemas.py does not import from pedidos |
| Pydantic serialization fails on relationship | The `from_attributes=True` config on PedidoRead handles SQLAlchemy objects natively |
| Admin list pagination loads too many relationships | `lazy="selectin"` issues a single batch query for all orders — acceptable for typical page sizes (20-100) |
