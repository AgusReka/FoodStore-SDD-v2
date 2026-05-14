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

**Old:** The system SHALL support updating payment status (e.g., from `pendiente` to `completado` or `fallido`).

**New:** The system SHALL support updating payment status. For direct payment methods (efectivo, transferencia), the status SHALL be updated via admin PATCH endpoint. For Mercado Pago payments, the status SHALL be updated via IPN webhook notifications from Mercado Pago, with a fallback manual update option for admins.

**Scenarios:**

#### Scenario: Mark payment as completed (admin)
- **WHEN** an admin sends a PATCH to `/api/v1/pagos/{id}/estado` with `nuevo_estado: "aprobado"`
- **THEN** the payment status SHALL change to `aprobado`
- **AND** the associated order status SHALL advance to `confirmado`

#### Scenario: MP payment is auto-updated via webhook
- **WHEN** a payment with method `mercadopago` receives an IPN notification with `status=approved`
- **THEN** the payment status SHALL change to `aprobado`
- **AND** the associated order status SHALL advance to `confirmado`

#### Scenario: Admin manually overrides MP payment
- **WHEN** an admin sends a PATCH to update status of a Mercado Pago payment
- **THEN** the system SHALL allow the manual override

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

### Requirement: Payment response includes Mercado Pago fields

The system SHALL include Mercado Pago-specific fields in the payment response when the payment method is `mercadopago`.

#### Scenario: MP payment includes preference_id and init_point
- **WHEN** a GET request retrieves a payment with method `mercadopago`
- **THEN** the response SHALL include `mp_preference_id` and `mp_init_point` fields (nullable)
- **AND** the standard fields SHALL remain unchanged

### Requirement: Payment can be queried by Mercado Pago reference

The system SHALL support retrieving a payment by its Mercado Pago payment ID for webhook processing.

#### Scenario: Find payment by MP payment ID
- **WHEN** an IPN notification is received containing an MP `payment_id`
- **THEN** the system SHALL be able to locate the corresponding internal payment record using `mp_payment_id`

