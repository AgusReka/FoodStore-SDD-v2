# payment-handling Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Create payment for order

The system SHALL support creating a payment record for an existing order with a specified payment method. Authenticated customers SHALL be able to create payments for their own orders.

**Scenarios:**

#### Scenario: Create payment for pending order
- **WHEN** a POST request is sent to `/api/v1/pagos` with `pedido_id`, `metodo_pago`, and `monto`
- **THEN** a new payment SHALL be created with status `pendiente` and status 201

#### Scenario: Customer creates payment for own order
- **WHEN** an authenticated customer sends a POST to `/api/v1/pagos` for their own order
- **THEN** the payment SHALL be created successfully

#### Scenario: Customer cannot create payment for another user's order
- **WHEN** an authenticated customer sends a POST to `/api/v1/pagos` for another user's order
- **THEN** the system SHALL return a 403 Forbidden error

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

The system SHALL support retrieving a payment record by its ID. Customers SHALL be able to read payments for their own orders.

**Scenarios:**

#### Scenario: Customer gets own payment
- **WHEN** an authenticated customer sends a GET to `/api/v1/pagos/{id}` for a payment on their own order
- **THEN** the matching payment record SHALL be returned

#### Scenario: Customer cannot get another user's payment
- **WHEN** an authenticated customer sends a GET to `/api/v1/pagos/{id}` for a payment on another user's order
- **THEN** the system SHALL return a 403 Forbidden error

### Requirement: Payment response includes order owner check

The system SHALL verify that the authenticated user owns the order when creating or reading payments.

#### Scenario: Verify order ownership on payment create
- **WHEN** a payment creation request is received
- **THEN** the system SHALL verify the authenticated user owns the order associated with the payment

