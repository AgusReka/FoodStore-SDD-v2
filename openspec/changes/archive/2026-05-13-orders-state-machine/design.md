## Context

The FoodStore backend currently handles order status transitions inside `OrderService.update_status()` using a simple Python dict (`valid_transitions`). The status enum (`OrderStatus`) lives in `backend/core/enums.py` with values: `pendiente`, `confirmado`, `preparando`, `enviado`, `entregado`, `cancelado`.

Current problems:
1. **No traceability**: When a status changes, we lose who did it and why
2. **Embedded logic**: Transitions, guards (stock deduction), and side effects are all in one method
3. **No isolation**: The state machine logic cannot be unit-tested without a full database
4. **Frontend duplication**: `OrderTimeline.tsx` hardcodes the same transition order
5. **Spec mismatch**: The `order-processing` spec references `en_preparacion` and `en_camino` which don't exist in the enum

## Goals / Non-Goals

**Goals:**
- Extract a formal, testable `OrderStateMachine` class with declarative transition rules
- Add an `order_history` table for full audit trail (actor, timestamp, reason)
- Align the `order-processing` spec with actual enum values
- Expose order history via API (admin: all, customer: own orders)
- Add comprehensive unit tests for the state machine
- Update frontend timeline to consume shared state definitions

**Non-Goals:**
- Automatic/scheduled transitions (e.g., timer-based "preparando" → "enviado") — deferred
- Real-time WebSocket push of status changes — deferred
- Renaming existing enum values (breaking change) — we align the spec to code, not vice versa
- State machine for payments or other entities — order only

## Decisions

### Decision 1: Dedicated `OrderStateMachine` class over a generic state machine library

**Choice**: Build a lightweight, domain-specific `OrderStateMachine` class instead of pulling in a library like `transitions` or `automaton`.

**Rationale**: The order state machine has ~6 states and ~6 transitions — too simple to justify a dependency. A custom class gives us full control over side effects (stock operations), guards, and error messages. The class will be pure Python (no DB dependency) and accept the current status + requested transition, returning success/error and any required side effects.

**Rejected alternatives:**
- `transitions` library: Adds a dependency for ~15 lines of transition rules; not worth it
- `automaton-lib`: Overkill for this use case

### Decision 2: History as a separate table, not JSONB on orders

**Choice**: Create a new `order_history` table with columns: `id`, `order_id`, `from_status`, `to_status`, `changed_by` (user_id), `reason` (nullable), `created_at`.

**Rationale**: Separate table keeps the `orders` table lean, allows efficient querying of history without deserializing JSONB, and supports future features like "show me all status changes by admin X". The write volume is low (a few writes per order lifecycle), so an append-only table is ideal.

**Rejected alternatives:**
- JSONB array on `orders`: Harder to query, no FK support, risk of hitting row size limits
- Application-level logging: Lost on server restart, no DB consistency

### Decision 3: State machine runs business logic; service orchestrates persistence

**Choice**: `OrderStateMachine` is a pure logic class that validates transitions and declares required side effects. `OrderService` calls the state machine, then executes side effects (stock deduction/restoration) within a transaction, and persists the new status + history record.

**Rationale**: Separates "what transitions are valid" from "how we persist the result". The state machine can be unit-tested without a DB. The service layer remains responsible for transactional integrity.

```
Flow:
OrderService.update_status(order_id, new_status, actor_id, reason)
  └─> order = repo.get_with_items(order_id)
  └─> machine = OrderStateMachine()
  └─> result = machine.transition(order.status, new_status)
      └─> validates transition rule exists
      └─> returns { allowed: bool, error?: str, side_effects?: [...] }
  └─> if not allowed → raise ValidationError
  └─> if side_effects includes "deduct_stock" → call _deduct_stock(order)
  └─> if side_effects includes "restore_stock" → call _restore_stock(order)
  └─> repo.update(order_id, status=new_status)
  └─> repo.add_history(order_id, from_status, to_status, actor_id, reason)
  └─> commit
```

### Decision 4: Expose history via `GET /pedidos/{id}/historial`

**Choice**: Add a new read-only endpoint returning ordered list of transitions.

**Rationale**: Customers need to see their order's audit trail. Admins need it for support. The endpoint checks ownership (customer sees own orders; admin sees all via permission).

### Decision 5: Frontend consumes shared constants

**Choice**: Create a shared TypeScript file with `ORDER_STATUS` constants and transition map; `OrderTimeline.tsx` uses this instead of hardcoded `STEPS`/`STATUS_ORDER`.

**Rationale**: Eliminates the duplication between backend enum and frontend timeline. The constants file can be generated/synced from the Python enum.

## Data Model

### New Table: `order_history`

```sql
CREATE TABLE order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    from_status VARCHAR(20) NOT NULL,
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES usuarios(id),
    reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_order_history_order_id ON order_history(order_id);
CREATE INDEX ix_order_history_created_at ON order_history(created_at DESC);
```

### New Python Model: `OrderHistory`

- Extends `Base` with columns: `id`, `order_id` (FK), `from_status`, `to_status`, `changed_by` (nullable FK), `reason` (nullable), `created_at`
- Relationship: `Order.history → list[OrderHistory]`

### OrderStatus Enum (unchanged values, but now the source of truth for transitions)

```python
class OrderStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    CONFIRMADO = "confirmado"
    PREPARANDO = "preparando"
    ENVIADO = "enviado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"
```

## API Changes

### New Endpoint: GET `/pedidos/{id}/historial`

- **Permission**: Customer (own orders) or ORDER_VIEW_HISTORY permission
- **Response**:
```json
[
  {
    "id": "uuid",
    "from_status": "pendiente",
    "to_status": "confirmado",
    "changed_by": "uuid",
    "reason": "Pago aprobado",
    "created_at": "2026-05-13T10:00:00Z"
  }
]
```

### Modified: PATCH `/pedidos/{id}/status`

- Request body now accepts optional `reason` field
- Returns history alongside updated order (or separate fetch)

## State Machine Definition

```
Transitions:
  pendiente   → confirmado   [guard: stock available; side_effect: deduct_stock]
  pendiente   → cancelado    [guard: none; side_effect: none]
  confirmado  → preparando   [guard: none; side_effect: none]
  confirmado  → cancelado    [guard: none; side_effect: restore_stock]
  preparando  → enviado      [guard: none; side_effect: none]
  enviado     → entregado    [guard: none; side_effect: none]
```

The `CANCELADO` status is a terminal state — no transitions out of it.
The `ENTREGADO` status is a terminal state — no transitions out of it.

### StateMachine class interface

```python
@dataclass
class TransitionResult:
    allowed: bool
    error: str | None = None
    side_effects: list[SideEffect] = field(default_factory=list)

class OrderStateMachine:
    """Pure state machine for Order status transitions."""

    def transition(self, from_status: OrderStatus, to_status: OrderStatus) -> TransitionResult: ...
```

## Order History Integration with Payment

When `PagoService.update_status()` sets payment to `APROBADO`, it currently directly sets order status to `CONFIRMADO`. This should be updated to go through the state machine to ensure validation and history recording.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing orders in DB have no history records | Backfill not needed — history starts from the moment of deployment. Old orders simply show no history entries for transitions that happened before. |
| Race condition: two concurrent status updates | Use `SELECT ... FOR UPDATE` on the order row within the transaction to serialize status changes |
| Payment auto-confirmation bypasses the new state machine | Refactor `PagoService` to call `OrderService.update_status()` (which uses the state machine) instead of directly setting `order.status` |
| Frontend constants drift from backend enum | Add a CI check or a manual sync step as part of the release process; document the shared constants location |
