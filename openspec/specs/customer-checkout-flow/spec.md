# customer-checkout-flow Specification

## Purpose
Checkout flow for customer order review, address selection, payment method selection, and order placement.
## Requirements
### Requirement: Customer can review order and select delivery address

**Old:** The system SHALL display an order review section on the checkout page with the list of items being purchased and let the customer select a delivery address.

**New:** The system SHALL display a 3-step checkout flow (Entrega, Pago, Resumen). On mobile the flow SHALL use a vertical accordion (each step numbered, expands below previous). On desktop the flow SHALL use a 2-column layout (left: steps 1-2 as form, right: sticky order summary 360px).

#### Scenario: Mobile shows vertical accordion
- **WHEN** a customer navigates to `/checkout` on mobile (< 768px)
- **THEN** the checkout SHALL display as a vertical accordion with numbered steps
- **AND** each step SHALL expand below the previous step when active

#### Scenario: Desktop shows 2-column layout
- **WHEN** a customer navigates to `/checkout` on desktop (768px+)
- **THEN** the checkout SHALL display a 2-column layout
- **AND** steps 1 (Entrega) and 2 (Pago) SHALL be displayed as a form in the left column
- **AND** step 3 (Resumen) SHALL be displayed as a sticky summary on the right at 360px

#### Scenario: Step 1 — Entrega shows order summary and address
- **WHEN** a customer views step 1 "Entrega"
- **THEN** the step SHALL display the order summary listing each item with name, quantity, unit price, and subtotal
- **AND** SHALL fetch and display saved addresses from the API
- **AND** the primary address SHALL be pre-selected

#### Scenario: Step 1 — Delivery speed toggle
- **WHEN** a customer views step 1 "Entrega"
- **THEN** a delivery speed toggle SHALL be displayed: "Standard $450" and "Express $850"
- **AND** "Standard" SHALL be selected by default

#### Scenario: Step 1 — Add new address during checkout
- **WHEN** a customer has no saved addresses or clicks "Agregar dirección"
- **THEN** an inline form or modal SHALL open with fields: calle, ciudad, código postal
- **AND** upon saving, the address SHALL be created via the API

#### Scenario: Step 2 — Pago shows payment method selection
- **WHEN** a customer navigates to step 2 "Pago"
- **THEN** the system SHALL display payment method options as selectable cards
- **AND** the TipSelector SHALL be displayed (if feature flag enabled)

#### Scenario: Step 3 — Resumen shows complete summary
- **WHEN** a customer navigates to step 3 "Resumen"
- **THEN** the system SHALL display a complete order summary: items, delivery address, delivery speed, payment method, tip, and total

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

**Old:** The system SHALL support placing the order from the checkout page, creating both the order and payment record.

**New:** (Unchanged behavior with Mesa-styled UI)

#### Scenario: Place order successfully
- **WHEN** a customer clicks "Confirmar pedido" with valid address and payment method
- **THEN** the system SHALL create the order and payment via API
- **AND** the cart SHALL be cleared
- **AND** the customer SHALL be navigated to an order confirmation screen with animated checkmark, order number, and estimated delivery time

#### Scenario: Place order with insufficient stock
- **WHEN** a customer clicks "Confirmar pedido" but stock has become insufficient
- **THEN** the system SHALL display a Mesa-styled inline error message indicating which items have stock issues
- **AND** the cart SHALL NOT be cleared

#### Scenario: Place order with network error
- **WHEN** a customer clicks "Confirmar pedido" but the API request fails
- **THEN** the system SHALL display a Mesa-styled error message with a "Reintentar" button

### Requirement: Checkout page shows submission loading state

**Old:** The system SHALL show clear loading feedback during order submission.

**New:** (Unchanged)

#### Scenario: Loading state during order submission
- **WHEN** a customer clicks "Confirmar pedido" and the request is in flight
- **THEN** the submit button SHALL show a loading spinner
- **AND** the button text SHALL change to "Procesando..."
- **AND** all form inputs SHALL be disabled

### Requirement: Checkout page redirects unauthenticated users

**Old:** The system SHALL protect the checkout route and redirect unauthenticated users.

**New:** (Unchanged)

#### Scenario: Unauthenticated user visits checkout
- **WHEN** an unauthenticated user navigates to `/checkout`
- **THEN** the system SHALL redirect to `/login` with a redirect back to `/checkout`

#### Scenario: Empty cart visits checkout
- **WHEN** a customer navigates to `/checkout` with an empty cart
- **THEN** the system SHALL redirect to `/cart` with a message indicating the cart is empty

### Requirement: Order confirmation screen after submit

The system SHALL display an order confirmation screen after successful order placement.

#### Scenario: Confirmation shows animated checkmark
- **WHEN** an order is placed successfully
- **THEN** the confirmation screen SHALL display an animated checkmark
- **AND** SHALL display the order number
- **AND** SHALL display the estimated delivery time
- **AND** SHALL display a "Ver pedido" button navigating to `/orders/{order_id}`

