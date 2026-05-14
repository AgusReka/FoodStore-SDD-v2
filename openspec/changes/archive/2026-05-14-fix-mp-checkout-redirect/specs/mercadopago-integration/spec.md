# mercadopago-integration Specification (Delta)

## MODIFIED Requirements

### Requirement: Frontend initiates MP checkout via session

The checkout flow SHALL create a temporary CheckoutSession and redirect the browser to Mercado Pago's hosted checkout page, deferring Order and Payment creation until MP confirms the payment was approved.

#### Scenario: Redirect to MP checkout on confirm
- **WHEN** a customer confirms an order with `mercadopago` payment method
- **THEN** the frontend SHALL send the cart items and selected address to `POST /api/v1/checkout/mp-init`
- **AND** the backend SHALL validate product existence and stock
- **AND** the backend SHALL calculate the total from current DB prices
- **AND** the backend SHALL create a `CheckoutSession` with status `pending`
- **AND** the backend SHALL create a Mercado Pago preference with `external_reference` set to the session ID
- **AND** the `back_urls` SHALL point to `GET /api/v1/checkout/mp-return`
- **AND** the backend SHALL return the `init_point` URL
- **AND** the frontend SHALL redirect the browser to the `init_point` URL using `window.location.href`

#### Scenario: MP-init fails
- **WHEN** the `POST /api/v1/checkout/mp-init` call fails (stock validation, MP API error)
- **THEN** the frontend SHALL show the error inline on the checkout page
- **AND** NO Order, Payment, or CheckoutSession SHALL be persisted

### Requirement: MP return handled by backend

The system SHALL handle Mercado Pago's redirect back to the application on the backend, creating the Order and Payment atomically when the payment is approved.

#### Scenario: Successful payment creates order
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `success`
- **AND** the `external_reference` matches a valid `pending` CheckoutSession
- **THEN** the backend SHALL re-validate stock for all items in the session
- **AND** SHALL create the Order with items from the session (via PedidoService)
- **AND** SHALL create the Payment linked to the Order (via PagoService)
- **AND** SHALL store `mp_preference_id` and `mp_payment_id` on the Payment record
- **AND** SHALL mark the CheckoutSession as `completed`
- **AND** SHALL clear the user's cart
- **AND** SHALL redirect the browser to the frontend order detail page (`/orders/:id?new=true`)

#### Scenario: Failed payment expires session
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `failure`
- **THEN** the backend SHALL mark the CheckoutSession as `expired`
- **AND** SHALL redirect the browser to the frontend cart page (`/cart?mp-error=true`)

#### Scenario: Duplicate return call is idempotent
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return` with status `success`
- **AND** the CheckoutSession is already `completed`
- **THEN** the backend SHALL NOT create a duplicate Order
- **AND** SHALL redirect the browser to the existing order detail page

#### Scenario: Expired session redirects to cart
- **WHEN** Mercado Pago redirects to `GET /api/v1/checkout/mp-return`
- **AND** the CheckoutSession is `expired`
- **THEN** the backend SHALL redirect the browser to the frontend cart page (`/cart?mp-error=true`)

### Requirement: Return URLs point to backend

The `back_urls` in the Mercado Pago preference SHALL point to the backend `mp-return` endpoint, not to the frontend.

#### Scenario: Backend return URLs
- **WHEN** a CheckoutSession-based MP preference is created
- **THEN** the `success` back_url SHALL be `<BACKEND_URL>/api/v1/checkout/mp-return?status=success`
- **AND** the `failure` back_url SHALL be `<BACKEND_URL>/api/v1/checkout/mp-return?status=failure`
- **AND** the `pending` back_url SHALL be `<BACKEND_URL>/api/v1/checkout/mp-return?status=pending`

## ADDED Requirements

### Requirement: CheckoutSession has 30-minute TTL

CheckoutSessions SHALL automatically expire 30 minutes after creation to prevent accumulation of stale sessions.

#### Scenario: Session expires after 30 minutes
- **WHEN** a CheckoutSession is created with status `pending`
- **THEN** its `expires_at` SHALL be `created_at + 30 minutes`
- **AND** the system SHALL consider sessions past `expires_at` as `expired`
- **AND** a background cleanup SHALL periodically mark expired sessions in the database

### Requirement: Order detail shows polling for pending MP payments

When a customer returns from Mercado Pago to the order detail page and the payment is still in `pendiente` status, the system SHALL automatically poll for status updates.

#### Scenario: Poll payment status after MP return
- **WHEN** the OrderDetailPage loads a payment with method `mercadopago`
- **AND** the payment status is `pendiente`
- **THEN** the frontend SHALL poll the order status every 3 seconds
- **AND** SHALL stop polling after 30 seconds or when status changes from `pendiente`
- **AND** SHALL show a "Verificando pago..." indicator during polling
- **AND** SHALL update the displayed status automatically when it changes
