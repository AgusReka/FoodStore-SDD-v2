## 1. Backend — Order State Machine

- [x] 1.1 Create `OrderStateMachine` class at `backend/modules/pedidos/state_machine.py` with declarative transition rules, guards, and side effect declarations
- [x] 1.2 Implement `transition(from_status, to_status) → TransitionResult` method that validates transitions and returns allowed + side effects
- [x] 1.3 Implement `get_valid_transitions(from_status) → list[OrderStatus]` method for use by frontend/API
- [x] 1.4 Add `SideEffect` enum (`DEDUCT_STOCK`, `RESTORE_STOCK`, `NONE`) for declarative side effect declarations
- [x] 1.5 Write comprehensive unit tests for all valid and invalid transitions, terminal states, and side effect declarations

## 2. Backend — Order History Model & Migration

- [x] 2.1 Create `OrderHistory` SQLAlchemy model at `backend/modules/pedidos/model.py` with columns: `id`, `order_id` (FK), `from_status`, `to_status`, `changed_by` (nullable FK), `reason` (nullable), `created_at`
- [x] 2.2 Add `history` relationship to `Order` model (one-to-many)
- [x] 2.3 Create Alembic migration for `order_history` table with indexes on `order_id` and `created_at`
- [x] 2.4 Create `OrderHistoryRead` Pydantic schema at `backend/modules/pedidos/schemas.py`

## 3. Backend — Repository Layer

- [x] 3.1 Add `add_history()` method to `PedidoRepository` to insert a history record
- [x] 3.2 Add `get_history(order_id) → list[OrderHistory]` method to `PedidoRepository`
- [x] 3.3 Add `get_with_history(order_id)` method with selectinload for history relationship

## 4. Backend — Service Layer Refactor

- [x] 4.1 Refactor `OrderService.update_status()` to instantiate `OrderStateMachine` and call `transition()` for validation
- [x] 4.2 Route side effects through state machine result (deduct stock on confirm, restore on cancel from confirmed)
- [x] 4.3 Record order history entry after every successful transition (from_status, to_status, actor_id, reason)
- [x] 4.4 Add optional `reason` parameter to `update_status()` signature
- [x] 4.5 Use `SELECT ... FOR UPDATE` within transaction to serialize concurrent status changes

## 5. Backend — Payment Integration

- [x] 5.1 Refactor `PagoService.update_status()` to call `OrderService.update_status()` instead of directly setting `order.status = CONFIRMADO`
- [x] 5.2 Handle the case where payment is approved but order cannot transition (log error, don't fail the payment update)

## 6. Backend — API Endpoints

- [x] 6.1 Add `GET /pedidos/{id}/history` endpoint returning ordered list of history records
- [x] 6.2 Add permission check: customer sees own order history, admin sees any
- [x] 6.3 Add optional `reason` field to `PedidoUpdateStatus` schema
- [x] 6.4 Update `PATCH /pedidos/{id}/status` to accept and forward the `reason` field

## 7. Frontend — Shared State Machine Constants

- [x] 7.1 Create TypeScript constants file (e.g., `frontend/src/shared/constants/orderStatus.ts`) with `ORDER_STATUS_TRANSITIONS` map mirroring the backend state machine
- [x] 7.2 Export `OrderStatus` type, `STATUS_LABELS` map, and `getValidTransitions(status)` helper

## 8. Frontend — Order Timeline Update

- [x] 8.1 Refactor `OrderTimeline.tsx` to import status steps from shared constants instead of hardcoded `STEPS`/`STATUS_ORDER`
- [x] 8.2 Verify timeline renders correctly for all statuses including `cancelado`

## 9. Frontend — Order History Display

- [x] 9.1 Create `OrderHistory` component showing timeline of status changes with timestamps and reasons
- [x] 9.2 Add history section to order detail page (customer and admin views)

## 10. Tests

- [x] 10.1 Unit tests: `OrderStateMachine` — all 6 valid transitions, all invalid transitions (wrong direction, terminal states, non-existent transitions)
- [x] 10.2 Unit tests: State machine side effect declarations match design spec
- [x] 10.3 Integration tests: Order history records created on every transition
- [x] 10.4 Integration tests: Concurrent status updates handled safely (FOR UPDATE)
- [x] 10.5 Integration tests: Payment approval triggers state machine flow
- [x] 10.6 Integration tests: History endpoint permission checks (own order vs other user vs admin)
- [x] 10.7 Integration tests: Cancellation stock restore works via state machine
