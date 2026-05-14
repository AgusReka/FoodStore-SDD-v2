# customer-checkout-flow Specification (Delta)

## MODIFIED Requirements

### Requirement: Customer can place the order

**Old:** The system SHALL support placing the order from the checkout page, creating both the order and payment record.

**New:** The system SHALL support placing the order from the checkout page, creating both the order and payment record. For Mercado Pago, the order and payment SHALL be created immediately (same as efectivo/transferencia), and the browser SHALL then be redirected to MP's hosted checkout.

#### Scenario: Place order with Mercado Pago
- **WHEN** a customer clicks "Confirmar pedido" with `mercadopago` payment method
- **THEN** the system SHALL create the Order (status `pending_mp`) and Payment (status `pendiente`) via `POST /api/v1/checkout/mp-init`
- **AND** the backend SHALL create a Mercado Pago preference with `external_reference` set to the Order ID
- **AND** the backend SHALL return the `init_point` URL
- **AND** the frontend SHALL redirect the browser to MP's hosted checkout via `window.location.href`
- **AND** the cart SHALL be cleared

#### Scenario: Place order with MP-init failure
- **WHEN** the `POST /api/v1/checkout/mp-init` call fails (stock validation, MP API error)
- **THEN** the system SHALL display an inline error message on the checkout page
- **AND** the cart SHALL NOT be cleared
- **AND** the Order SHALL NOT be created (transaction rolls back)

#### Scenario: Place order successfully (efectivo/transferencia)
- **WHEN** a customer clicks "Confirmar pedido" with `efectivo` or `transferencia` payment method
- **THEN** the system SHALL create the Order (status `pendiente`) and Payment (status `pendiente`) via API
- **AND** the cart SHALL be cleared
- **AND** the customer SHALL be navigated to `/orders/{order_id}?new=true`

## ADDED Requirements

### Requirement: MP return handled by backend with status update

The system SHALL handle Mercado Pago's redirect back via the backend endpoint, updating Order and Payment status based on the MP result.

#### Scenario: Successful payment confirms order
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `success`
- **AND** the Order exists in `pending_mp` status
- **THEN** the Payment SHALL be updated to `aprobado`
- **AND** the Order SHALL transition to `confirmado` with stock deducted
- **AND** the browser SHALL be redirected to the frontend order detail page (`/orders/{order_id}?new=true`)

#### Scenario: Failed payment cancels order
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `failure`
- **THEN** the Order SHALL be marked as `cancelado`
- **AND** the Payment SHALL be marked as `rechazado`
- **AND** the browser SHALL be redirected to the frontend cart page (`/cart?mp-error=true`)

#### Scenario: Pending payment redirects to order detail
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `pending`
- **THEN** the browser SHALL be redirected to the frontend order detail page (`/orders/{order_id}?new=true`)
- **AND** the Order SHALL remain in `pending_mp` status pending webhook confirmation
