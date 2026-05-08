# Spec: payment-handling

## ADDED Requirements

### Requirement: Create payment for order

The system SHALL support creating a payment record for an existing order with a specified payment method.

**Scenarios:**

#### Scenario: Create payment for pending order
- **WHEN** a POST request is sent to `/api/v1/pagos` with `pedido_id`, `metodo_pago`, and `monto`
- **THEN** a new payment SHALL be created with status `pendiente` and status 201

#### Scenario: Create payment for already paid order
- **WHEN** a POST request is sent for an order that already has a completed payment
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Update payment status

The system SHALL support updating payment status (e.g., from `pendiente` to `completado` or `fallido`).

**Scenarios:**

#### Scenario: Mark payment as completed
- **WHEN** a PATCH request is sent to `/api/v1/pagos/{id}/estado` with `nuevo_estado: "completado"`
- **THEN** the payment status SHALL change to `completado`
- **AND** the associated order status SHALL advance to `confirmado`

### Requirement: Get payment by ID

The system SHALL support retrieving a payment record by its ID.

**Scenarios:**

#### Scenario: Get payment
- **WHEN** a GET request is sent to `/api/v1/pagos/{id}`
- **THEN** the matching payment record SHALL be returned
