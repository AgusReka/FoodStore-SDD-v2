# Spec: order-processing

## ADDED Requirements

### Requirement: Create order

The system SHALL support creating an order from selected products with quantities and a delivery address.

**Scenarios:**

#### Scenario: Create order with valid items
- **WHEN** a POST request is sent to `/api/v1/pedidos` with a list of `product_id` and `cantidad` pairs and a `direccion_id`
- **THEN** a new order SHALL be created with status `pendiente` and status 201

#### Scenario: Create order with insufficient stock
- **WHEN** a POST request requests a quantity exceeding available stock for a product
- **THEN** the system SHALL return a 409 Conflict error indicating insufficient stock

#### Scenario: Create order with non-existent product
- **WHEN** a POST request includes a `product_id` that does not exist
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Order status transitions

The system SHALL enforce valid order status transitions: `pendiente` → `confirmado` → `en_preparacion` → `en_camino` → `entregado`. Cancellation is allowed from `pendiente` or `confirmado` only.

**Scenarios:**

#### Scenario: Confirm pending order
- **WHEN** a PATCH request is sent to `/api/v1/pedidos/{id}/estado` with `nuevo_estado: "confirmado"`
- **THEN** the order status SHALL change to `confirmado`

#### Scenario: Cancel pending order
- **WHEN** a PATCH request is sent with `nuevo_estado: "cancelado"` for an order in `pendiente` status
- **THEN** the order SHALL be cancelled

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
