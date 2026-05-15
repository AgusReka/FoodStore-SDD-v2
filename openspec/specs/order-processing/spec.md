# order-processing Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Create order

The system SHALL support creating an order from selected products with quantities, validating stock availability before creation.

**Scenarios:**

#### Scenario: Create order with valid items
- **WHEN** a POST request is sent to `/api/v1/pedidos` with a list of `product_id` and `cantidad` pairs and a `direccion_id`
- **THEN** a new order SHALL be created with status `pendiente` and status 201

#### Scenario: Create order with insufficient stock (simple product)
- **WHEN** a POST request requests a quantity of a simple product exceeding its `stock_cantidad`
- **THEN** the system SHALL return a 409 Conflict error indicating insufficient stock

#### Scenario: Create order with insufficient stock (compound product)
- **WHEN** a POST request requests a quantity of a compound product exceeding what its ingredients can produce
- **THEN** the system SHALL return a 409 Conflict error naming the limiting ingredient

#### Scenario: Create order with non-existent product
- **WHEN** a POST request includes a `product_id` that does not exist
- **THEN** the system SHALL return a 404 Not Found error

#### Scenario: Create order with unavailable product
- **WHEN** a POST request includes a product with `is_available: false`
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Order status transitions

Previously: The system SHALL enforce valid order status transitions: `pendiente` → `confirmado` → `en_preparacion` → `en_camino` → `entregado`.

Now: The system SHALL enforce valid order status transitions using a formal state machine. The valid transitions are:

```
pendiente   → confirmado   [guard: stock available; side_effect: deduct_stock]
pendiente   → cancelado    [guard: none; side_effect: none]
confirmado  → preparando   [guard: none; side_effect: none]
confirmado  → cancelado    [guard: none; side_effect: restore_stock]
preparando  → enviado      [guard: none; side_effect: none]
enviado     → entregado    [guard: none; side_effect: none]
```

**Status name alignment**: The spec now uses `preparando` instead of `en_preparacion` and `enviado` instead of `en_camino` to match the actual `OrderStatus` enum values.

#### Scenario: Confirm pending order decrements stock
- **WHEN** a PATCH request transitions an order from `pendiente` to `confirmado`
- **THEN** the order status SHALL change to `confirmado`
- **AND** the system SHALL atomically decrement stock for each item

#### Scenario: Confirm pending order with insufficient stock
- **WHEN** a PATCH request attempts to confirm an order but stock became insufficient since creation
- **THEN** the system SHALL return a 409 Conflict error
- **AND** the order SHALL remain in `pendiente` status

#### Scenario: Cancel pending order (no stock change)
- **WHEN** an order in `pendiente` status is cancelled
- **THEN** the order SHALL be cancelled
- **AND** no stock SHALL be modified

#### Scenario: Cancel confirmed order restores stock
- **WHEN** an order in `confirmado` status is cancelled
- **THEN** the order SHALL be cancelled
- **AND** all previously deducted stock SHALL be restored atomically

#### Scenario: Cannot cancel shipped order
- **WHEN** an attempt is made to cancel an order in `enviado` status
- **THEN** the system SHALL return a 400 Bad Request error

#### Scenario: Cannot transition from terminal states
- **WHEN** an attempt is made to change status of an order in `entregado` or `cancelado` status
- **THEN** the system SHALL return a 400 Bad Request error

#### Scenario: State machine rejects invalid transition
- **WHEN** an attempt is made to transition from `pendiente` directly to `entregado`
- **THEN** the system SHALL return a 400 Bad Request error

### Requirement: List user orders

The system SHALL support listing orders for the authenticated user with pagination and status filtering.

**Scenarios:**

#### Scenario: List my orders
- **WHEN** a GET request is sent to `/api/v1/pedidos`
- **THEN** a paginated list of the current user's orders SHALL be returned

#### Scenario: Filter my orders by status
- **WHEN** a GET request is sent to `/api/v1/pedidos?estado=pendiente`
- **THEN** only orders with `pendiente` status SHALL be returned

#### Scenario: Filter with invalid status
- **WHEN** a GET request is sent to `/api/v1/pedidos?estado=invalid_status`
- **THEN** the system SHALL return a 422 Validation Error

### Requirement: State machine is independently testable

The system SHALL implement the state machine as a pure, independently testable class with no database dependencies.

#### Scenario: State machine validates transition without DB
- **WHEN** the state machine's `transition()` method is called with `from_status` and `to_status`
- **THEN** it SHALL return a result indicating whether the transition is allowed
- **AND** it SHALL NOT require a database connection

#### Scenario: State machine declares required side effects
- **WHEN** the state machine validates a transition from `pendiente` to `confirmado`
- **THEN** the result SHALL include a `deduct_stock` side effect declaration

### Requirement: Payment auto-confirmation uses state machine

When a payment is approved, the order status advancement to `confirmado` SHALL go through the state machine to ensure validation and history recording.

#### Scenario: Payment approval transitions order via state machine
- **WHEN** a payment status changes to `aprobado`
- **THEN** the system SHALL use the state machine to transition the order to `confirmado`
- **AND** SHALL record the transition in order history

#### Scenario: Payment approval on invalid state
- **WHEN** a payment is approved for an order not in `pendiente` status
- **THEN** the system SHALL return an error
- **AND** the payment status update SHALL still succeed (payment is separate from order)

### Requirement: Admin can view any order detail

The system SHALL allow admin users to view the detail of any order via `GET /pedidos/{id}`, even if they are not the order owner.

#### Scenario: Admin views any order detail
- **WHEN** a user with role `admin` sends a GET request to `/api/v1/pedidos/{id}` for an order owned by a different user
- **THEN** the system SHALL return the order detail
- **AND** SHALL NOT return a 403 Forbidden error

#### Scenario: Non-admin cannot view other users' orders
- **WHEN** a user with role `cliente` sends a GET request to `/api/v1/pedidos/{id}` for an order owned by a different user
- **THEN** the system SHALL return a 403 Forbidden error

