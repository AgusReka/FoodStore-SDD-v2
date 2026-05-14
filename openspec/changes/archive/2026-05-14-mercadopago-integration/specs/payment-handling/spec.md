# payment-handling Specification

## MODIFIED Requirements

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

## ADDED Requirements

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
