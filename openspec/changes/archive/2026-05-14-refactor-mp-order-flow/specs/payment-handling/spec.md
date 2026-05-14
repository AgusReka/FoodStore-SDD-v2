# payment-handling Specification (Delta)

## MODIFIED Requirements

### Requirement: Create payment for order

**New:** The system SHALL support creating a payment record for an existing order with a specified payment method. For Mercado Pago, the payment SHALL be created immediately during `mp-init` (same as other methods), not deferred.

#### Scenario: Create payment for Mercado Pago order
- **WHEN** a customer confirms an order with `mercadopago` payment method
- **THEN** a new Payment SHALL be created with status `pendiente` and method `mercadopago`
- **AND** `mp_preference_id` and `mp_init_point` SHALL be stored on the Payment record
- **AND** the Payment SHALL be linked to the Order created in the same request

### Requirement: Update payment status

**New:** The system SHALL support updating payment status. When a Mercado Pago payment is approved via webhook or mp-return, the payment status SHALL update to `aprobado` and the order SHALL transition to `confirmado`.

#### Scenario: Mark MP payment as approved via mp-return
- **WHEN** Mercado Pago redirects to mp-return with status `success`
- **THEN** the Payment SHALL change to `aprobado`
- **AND** the associated Order SHALL transition from `pending_mp` to `confirmado`
- **AND** stock SHALL be deducted atomically

#### Scenario: Mark MP payment as rejected via mp-return
- **WHEN** Mercado Pago redirects to mp-return with status `failure`
- **THEN** the Payment SHALL change to `rechazado`
- **AND** the associated Order SHALL transition from `pending_mp` to `cancelado`

## REMOVED Requirements

### Requirement: Payment status polling for Mercado Pago pending payments

**Reason**: Ya no es necesario porque el Payment se crea APROBADO directamente desde `process_status_update` en `mp-return` o webhook. La orden ya no queda en un estado de polling.

**Migration**: Eliminar el polling de 30 segundos en `OrderDetailPage` (el timer `setInterval` con `refetch` cada 3s). Si el webhook se demora, el usuario puede recargar la página manualmente.
