# order-processing Specification (Delta)

## MODIFIED Requirements

### Requirement: Order status transitions

Previously: The system SHALL enforce valid order status transitions using a formal state machine with statuses `pendiente`, `confirmado`, `preparando`, `enviado`, `entregado`, `cancelado`.

Now: The system SHALL enforce valid order status transitions using a formal state machine with statuses `pendiente`, `pending_mp`, `confirmado`, `preparando`, `enviado`, `entregado`, `cancelado`.

The valid transitions are:

```
pendiente   → confirmado   [guard: stock available; side_effect: deduct_stock]
pendiente   → cancelado    [guard: none; side_effect: none]
pending_mp  → confirmado   [guard: stock available; side_effect: deduct_stock]   ← NUEVO
pending_mp  → cancelado    [guard: none; side_effect: none]                       ← NUEVO
confirmado  → preparando   [guard: none; side_effect: none]
confirmado  → cancelado    [guard: none; side_effect: restore_stock]
preparando  → enviado      [guard: none; side_effect: none]
enviado     → entregado    [guard: none; side_effect: none]
```

#### Scenario: Confirm pending_mp order decrements stock
- **WHEN** an order transitions from `pending_mp` to `confirmado`
- **THEN** the order status SHALL change to `confirmado`
- **AND** the system SHALL atomically decrement stock for each item

#### Scenario: Cancel pending_mp order (no stock change)
- **WHEN** an order in `pending_mp` status is cancelled
- **THEN** the order SHALL be cancelled
- **AND** no stock SHALL be modified (stock was never deducted)
