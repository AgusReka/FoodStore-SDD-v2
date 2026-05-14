# payment-handling Specification (Delta)

## ADDED Requirements

### Requirement: Payment status polling for Mercado Pago pending payments

The system SHALL support automatic polling of payment status on the order detail page when the payment method is Mercado Pago and the status is `pendiente`, to detect webhook updates without requiring a manual page refresh.

#### Scenario: Poll for status change after returning from MP
- **WHEN** a customer views an order detail page
- **AND** the payment method is `mercadopago`
- **AND** the payment status is `pendiente`
- **THEN** the frontend SHALL automatically poll `GET /api/v1/pedidos/:id` every 3 seconds
- **AND** SHALL stop polling when status changes from `pendiente` or after 10 attempts (30 seconds)
- **AND** SHALL display updated payment status without page reload

#### Scenario: Do not poll for non-MP payments
- **WHEN** the payment method is `efectivo` or `transferencia`
- **THEN** the frontend SHALL NOT poll for status changes
