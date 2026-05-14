# mercadopago-integration Specification

## Purpose
TBD - created by archiving change mercadopago-integration. Update Purpose after archive.
## Requirements
### Requirement: Backend can create Mercado Pago payment preference

The system SHALL create a Mercado Pago Checkout Pro preference for a given payment record, returning the init_point URL for frontend redirect.

#### Scenario: Create MP preference successfully
- **WHEN** a POST request is sent to `/api/v1/pagos/mercadopago/create-preference` with a valid `payment_id`
- **THEN** the system SHALL create an MP preference via the SDK
- **AND** SHALL store `mp_preference_id` and `mp_init_point` on the payment record
- **AND** SHALL return the `init_point` URL in the response

#### Scenario: Create preference for non-MP payment
- **WHEN** a POST request is sent for a payment whose method is not `mercadopago`
- **THEN** the system SHALL return a 400 Bad Request error

#### Scenario: Create preference for already-approved payment
- **WHEN** a POST request is sent for a payment already in `aprobado` status
- **THEN** the system SHALL return a 409 Conflict error

#### Scenario: Create preference for non-existent payment
- **WHEN** a POST request references a payment_id that does not exist
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Backend handles Mercado Pago IPN webhook

The system SHALL accept IPN (Instant Payment Notification) webhooks from Mercado Pago and update the corresponding payment status.

#### Scenario: Receive valid IPN for approved payment
- **WHEN** an IPN notification is received at `/api/v1/pagos/mercadopago/webhook` for a payment with status `approved`
- **THEN** the system SHALL validate the X-Signature header
- **AND** SHALL re-fetch the payment status from MP API
- **AND** SHALL update the internal payment status to `aprobado`
- **AND** SHALL transition the associated order to `confirmado`

#### Scenario: Receive valid IPN for rejected payment
- **WHEN** an IPN notification is received for a payment with status `rejected`
- **THEN** the system SHALL update the internal payment status to `rechazado`

#### Scenario: Receive valid IPN for in_process payment
- **WHEN** an IPN notification is received for a payment with status `in_process`
- **THEN** the system SHALL keep the payment status as `pendiente`

#### Scenario: Receive IPN with invalid signature
- **WHEN** an IPN notification is received with an invalid `X-Signature` header
- **THEN** the system SHALL return a 401 Unauthorized error
- **AND** SHALL NOT update any payment status

#### Scenario: Receive IPN for payment_id not in our system
- **WHEN** an IPN notification references a `payment_id` not found in our database
- **THEN** the system SHALL return a 404 Not Found error

#### Scenario: Receive IPN without authentication (public endpoint)
- **WHEN** an unauthenticated POST request is sent to the webhook endpoint
- **THEN** the system SHALL process it (validating signature, not user auth)
- **AND** SHALL NOT require JWT authentication

### Requirement: Mercado Pago payment status mapping

The system SHALL map Mercado Pago payment statuses to internal PaymentStatus values.

#### Scenario: Map MP approved to our aprobado
- **WHEN** an IPN notification or status check returns MP status `approved`
- **THEN** the system SHALL map it to internal status `aprobado`

#### Scenario: Map MP rejected to our rechazado
- **WHEN** MP status is `rejected` or `cancelled` or `charged_back`
- **THEN** the system SHALL map it to internal status `rechazado`

#### Scenario: Map MP in_process/in_mediation to our pendiente
- **WHEN** MP status is `in_process` or `in_mediation`
- **THEN** the system SHALL keep internal status as `pendiente`

#### Scenario: Map MP refunded to our reembolsado
- **WHEN** MP status is `refunded`
- **THEN** the system SHALL map it to internal status `reembolsado`

### Requirement: Frontend redirects to Mercado Pago Checkout Pro

The checkout flow SHALL redirect the browser to Mercado Pago's hosted checkout page when the user confirms an order with Mercado Pago selected as payment method.

#### Scenario: Redirect to MP checkout on confirm
- **WHEN** a customer confirms an order with `mercadopago` payment method
- **THEN** the frontend SHALL create the order via API
- **AND** SHALL create the payment via API
- **AND** SHALL call the create-preference endpoint
- **AND** SHALL redirect the browser to the returned `init_point` URL

#### Scenario: MP preference creation fails
- **WHEN** the create-preference API call returns an error
- **THEN** the frontend SHALL display an error message
- **AND** SHALL show a "Reintentar" button

### Requirement: Frontend handles Mercado Pago return URLs

The system SHALL handle customers returning from Mercado Pago Checkout Pro on success, failure, or pending.

#### Scenario: Successful payment return
- **WHEN** a customer returns to the app from MP with `status=success` query param
- **THEN** the frontend SHALL display the order confirmation screen
- **AND** SHALL show the payment as approved

#### Scenario: Failed payment return
- **WHEN** a customer returns from MP with `status=failure` query param
- **THEN** the frontend SHALL show the payment as failed
- **AND** SHALL provide options to retry with a different method or try again

#### Scenario: Pending payment return
- **WHEN** a customer returns from MP with `status=pending` query param
- **THEN** the frontend SHALL display the order with the payment as pending
- **AND** SHALL show a "Pagar ahora" button to go back to MP checkout

