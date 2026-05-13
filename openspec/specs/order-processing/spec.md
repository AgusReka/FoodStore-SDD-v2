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

The system SHALL enforce valid order status transitions: `pendiente` → `confirmado` → `en_preparacion` → `en_camino` → `entregado`. Cancellation is allowed from `pendiente` or `confirmado` only. Stock SHALL be decremented on confirmation and restored on cancellation from `confirmado`.

**Scenarios:**

#### Scenario: Confirm pending order decrements stock
- **WHEN** a PATCH request is sent to `/api/v1/pedidos/{id}/estado` with `nuevo_estado: "confirmado"`
- **THEN** the order status SHALL change to `confirmado`
- **AND** the system SHALL atomically decrement stock for each item

#### Scenario: Confirm pending order with insufficient stock
- **WHEN** a PATCH request is sent to confirm an order but stock became insufficient since creation
- **THEN** the system SHALL return a 409 Conflict error
- **AND** the order SHALL remain in `pendiente` status

#### Scenario: Cancel pending order (no stock change)
- **WHEN** a PATCH request is sent with `nuevo_estado: "cancelado"` for an order in `pendiente` status
- **THEN** the order SHALL be cancelled
- **AND** no stock SHALL be modified (stock was never decremented for pending orders)

#### Scenario: Cancel confirmed order restores stock
- **WHEN** a PATCH request is sent with `nuevo_estado: "cancelado"` for an order in `confirmado` status
- **THEN** the order SHALL be cancelled
- **AND** all stock previously decremented SHALL be restored atomically

#### Scenario: Cancel shipped order
- **WHEN** a PATCH request is sent with `nuevo_estado: "cancelado"` for an order in `en_camino` status
- **THEN** the system SHALL return a 400 Bad Request error (cannot cancel after shipment)

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

