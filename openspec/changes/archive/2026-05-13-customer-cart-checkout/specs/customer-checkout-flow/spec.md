## ADDED Requirements

### Requirement: Customer can review order and select delivery address

The system SHALL display an order review section on the checkout page with the list of items being purchased and let the customer select a delivery address.

#### Scenario: Checkout page shows order summary
- **WHEN** a customer navigates to `/checkout` with items in their cart
- **THEN** the page SHALL display an order summary listing each item with name, quantity, unit price, and subtotal
- **AND** the page SHALL display the cart total

#### Scenario: Checkout shows saved addresses
- **WHEN** a customer navigates to `/checkout`
- **THEN** the system SHALL fetch and display the customer's saved addresses from `GET /api/v1/direcciones`
- **AND** the address marked as `es_principal` SHALL be pre-selected

#### Scenario: Select a different delivery address
- **WHEN** a customer clicks on a different address card
- **THEN** that address SHALL become the selected delivery address
- **AND** the previously selected address SHALL be deselected

#### Scenario: No saved addresses
- **WHEN** the customer has no saved addresses
- **THEN** the system SHALL display a message "No tenés direcciones guardadas"
- **AND** a button to "Agregar dirección" SHALL be shown

#### Scenario: Add new address during checkout
- **WHEN** a customer clicks "Agregar dirección" on the checkout page
- **THEN** an inline form or modal SHALL open with fields: calle, ciudad, código postal
- **AND** upon saving, the address SHALL be created via `POST /api/v1/direcciones`
- **AND** the new address SHALL appear and be selected in the address list

### Requirement: Customer can select payment method

The system SHALL let the customer choose a payment method on the checkout page.

#### Scenario: Payment method options are displayed
- **WHEN** a customer views the checkout page
- **THEN** the system SHALL display payment method options as radio buttons or selectable cards
- **AND** the default payment method SHALL be pre-selected

#### Scenario: Select payment method
- **WHEN** a customer clicks a different payment method
- **THEN** that payment method SHALL become selected

### Requirement: Customer can place the order

The system SHALL support placing the order from the checkout page, creating both the order and payment record.

#### Scenario: Place order successfully
- **WHEN** a customer clicks "Confirmar pedido" with valid address and payment method
- **THEN** the system SHALL call `POST /api/v1/pedidos` with the cart items and selected address_id
- **AND** on success, call `POST /api/v1/pagos` with the order_id, payment method, and amount
- **AND** the cart SHALL be cleared
- **AND** the customer SHALL be navigated to an order confirmation page with the order ID

#### Scenario: Place order with insufficient stock
- **WHEN** a customer clicks "Confirmar pedido" but stock has become insufficient for one or more items
- **THEN** the system SHALL display an inline error message indicating which items have stock issues
- **AND** the cart SHALL NOT be cleared
- **AND** the order SHALL NOT be created

#### Scenario: Place order with network error
- **WHEN** a customer clicks "Confirmar pedido" but the API request fails
- **THEN** the system SHALL display a generic error message with a "Reintentar" button
- **AND** the cart SHALL NOT be cleared

### Requirement: Checkout page shows submission loading state

The system SHALL show clear loading feedback during order submission.

#### Scenario: Loading state during order submission
- **WHEN** a customer clicks "Confirmar pedido" and the request is in flight
- **THEN** the submit button SHALL show a loading spinner
- **AND** the button text SHALL change to "Procesando..."
- **AND** all form inputs SHALL be disabled to prevent double submission

### Requirement: Checkout page redirects unauthenticated users

The system SHALL protect the checkout route and redirect unauthenticated users.

#### Scenario: Unauthenticated user visits checkout
- **WHEN** an unauthenticated user navigates to `/checkout`
- **THEN** the system SHALL redirect to `/login`
- **AND** after login, the user SHALL be redirected back to `/checkout`

#### Scenario: Empty cart visits checkout
- **WHEN** a customer navigates to `/checkout` with an empty cart
- **THEN** the system SHALL redirect to `/cart` with a message indicating the cart is empty
