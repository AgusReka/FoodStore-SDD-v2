## Why

The current order status transition logic is embedded as a simple Python dictionary inside `OrderService.update_status()`, making it difficult to test independently, extend with new transitions, enforce business rules consistently, or audit order lifecycle events. There is no audit trail of status changes, the frontend duplicates the state machine definition in `OrderTimeline.tsx`, and the existing spec (`order-processing`) uses status names (`en_preparacion`, `en_camino`) that don't match the actual enum values in code (`preparando`, `enviado`). A formal, testable state machine abstraction is needed to ensure reliability as the order lifecycle grows in complexity.

## What Changes

- **Formalize order state machine**: Extract transition logic into a dedicated `OrderStateMachine` class with declarative transition rules, guards, and side effects
- **Add order history / audit trail**: Create an `order_history` table recording every status transition with timestamp, actor, and reason
- **Align spec with code**: Update `order-processing` spec to use actual enum values (`preparando`, `enviado`) instead of non-existent names (`en_preparacion`, `en_camino`)
- **Expose order history via API**: Add GET endpoint for order history (admin: full history, customer: own orders)
- **Frontend updates**: Use API-driven state machine definition (or shared constants) instead of hardcoded timeline steps
- **Add unit tests**: Comprehensive tests for the state machine covering all valid and invalid transitions, stock side effects, and edge cases

## Capabilities

### New Capabilities
- `order-history`: Audit trail of order status transitions — who changed what, when, and why

### Modified Capabilities
- `order-processing`: Fix status name mismatches in spec (`en_preparacion` → `preparando`, `en_camino` → `enviado`); add formal transition rules and history recording as requirements

## Impact

- **Backend**: New `order_history` table/model/repository/service; new `OrderStateMachine` class; modified `OrderService.update_status()` to use the state machine; new API endpoint for order history
- **Frontend**: Update `OrderTimeline.tsx` to consume shared state machine definition; add order history display
- **Tests**: New unit tests for the state machine; updated integration tests for order status transitions
- **Database**: New migration for `order_history` table
- **Docs**: Update `order-processing` spec; create `order-history` spec
