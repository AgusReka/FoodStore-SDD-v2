## MODIFIED Requirements

### Requirement: Order status transitions

The system SHALL enforce valid order status transitions using a formal state machine with role-based authorization.

The valid transitions and authorized roles are:

```
pendiente   → confirmado   [roles: sistema (auto);   side_effect: deduct_stock]
pendiente   → cancelado    [roles: cliente, pedidos, admin; side_effect: none]
confirmado  → preparando   [roles: cocina, pedidos, admin; side_effect: none]
confirmado  → cancelado    [roles: pedidos, admin;    side_effect: restore_stock]
preparando  → enviado      [roles: cocina, pedidos, admin; side_effect: none]
preparando  → cancelado    [roles: admin;              side_effect: restore_stock]
enviado     → entregado    [roles: pedidos, admin;     side_effect: none]
```

#### Scenario: COCINA can transition confirmado → preparando
- **WHEN** a user with role `cocina` attempts `confirmado → preparando`
- **THEN** the transition SHALL be allowed

#### Scenario: COCINA can transition preparando → enviado
- **WHEN** a user with role `cocina` attempts `preparando → enviado`
- **THEN** the transition SHALL be allowed

#### Scenario: COCINA cannot cancel a confirmed order
- **WHEN** a user with role `cocina` attempts `confirmado → cancelado`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: COCINA cannot cancel a preparing order
- **WHEN** a user with role `cocina` attempts `preparando → cancelado`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: COCINA cannot mark order as delivered
- **WHEN** a user with role `cocina` attempts `enviado → entregado`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Admin can perform any transition
- **WHEN** a user with role `admin` attempts any valid transition
- **THEN** the transition SHALL be allowed (admin bypass)

## ADDED Requirements

### Requirement: State machine validates role authorization

The state machine SHALL validate that the actor's role is authorized for the requested transition, not just that the transition is valid.

#### Scenario: State machine rejects unauthorized role
- **WHEN** `state_machine.transition(CONFIRMADO, CANCELADO, actor_role=UserRole.COCINA)` is called
- **THEN** the result SHALL have `allowed=False` and an error indicating unauthorized role

#### Scenario: State machine allows authorized role
- **WHEN** `state_machine.transition(CONFIRMADO, PREPARANDO, actor_role=UserRole.COCINA)` is called
- **THEN** the result SHALL have `allowed=True`

### Requirement: Published SSE events on status transitions

When an order changes status within or entering the kitchen phase, the system SHALL publish an SSE event to connected KDS clients.

#### Scenario: Event published after commit
- **WHEN** a status transition is committed successfully
- **THEN** the system SHALL publish the corresponding SSE event (PEDIDO_CONFIRMADO, PEDIDO_EN_PREPARACION, PEDIDO_EN_CAMINO, or PEDIDO_CANCELADO)

#### Scenario: Event not published on failed transaction
- **WHEN** a status transition fails (e.g., stock insufficient)
- **THEN** the system SHALL NOT publish any SSE event

#### Scenario: No event if no clients connected
- **WHEN** a status transition occurs but no KDS clients are connected
- **THEN** the system SHALL NOT error (best-effort, event is silently dropped)

### Requirement: KDS REST endpoint for state recovery

The system SHALL provide a REST endpoint that returns the current kitchen state for initial load and polling fallback.

#### Scenario: Returns confirmed and preparing orders
- **WHEN** `GET /api/v1/cocina/pedidos` is called
- **THEN** the response SHALL include all orders with status `CONFIRMADO` or `PREPARANDO`

#### Scenario: Orders ordered by kitchen entry time
- **WHEN** `GET /api/v1/cocina/pedidos` returns orders
- **THEN** they SHALL be ordered by the time they entered `CONFIRMADO` (ascending, oldest first)

#### Scenario: Each order includes kitchen entry timestamp
- **WHEN** `GET /api/v1/cocina/pedidos` returns orders
- **THEN** each order SHALL include a `confirmed_at` field (the `created_at` of the history entry where status became CONFIRMADO)
