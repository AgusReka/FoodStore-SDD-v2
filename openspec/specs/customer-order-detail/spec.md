# customer-order-detail Specification

## Purpose
TBD - created by archiving change customer-orders. Update Purpose after archive.
## Requirements
### Requirement: Customer can view full order details

The system SHALL provide a `/orders/:id` page that displays the complete details of a single order, including items, status, payment, and delivery address.

#### Scenario: Order detail shows all information
- **WHEN** an authenticated customer navigates to `/orders/{order_id}`
- **THEN** the system SHALL fetch the order from `GET /api/v1/pedidos/{order_id}`
- **AND** display: order ID, status badge, creation date, total, currency
- **AND** display a list of all line items (product name, quantity, unit price, subtotal)
- **AND** display the delivery address (if set)
- **AND** display the payment method and payment status

#### Scenario: Order detail shows status timeline
- **WHEN** a customer views an order detail page
- **THEN** the system SHALL display a visual status timeline showing the order's lifecycle progress

#### Scenario: Loading state for order detail
- **WHEN** the order detail is being fetched
- **THEN** the page SHALL display skeleton placeholders

#### Scenario: Error state for order detail
- **WHEN** the order detail fetch fails
- **THEN** the page SHALL display an error message with a "Reintentar" button

#### Scenario: Access denied for other user's order
- **WHEN** an authenticated customer tries to view another customer's order
- **THEN** the system SHALL display a "404 No encontrado" error

### Requirement: Order detail shows payment information

The system SHALL display payment details on the order detail page.

#### Scenario: Order detail shows payment method and status
- **WHEN** a customer views an order with an associated payment
- **THEN** the page SHALL display the payment method (e.g., "Efectivo", "Transferencia", "Mercado Pago")
- **AND** the payment status badge (e.g., "Pendiente", "Aprobado", "Rechazado")

#### Scenario: Payment still pending
- **WHEN** a customer views an order whose payment is still pending
- **THEN** the page SHALL show the payment status as "Pendiente" with appropriate styling

### Requirement: Order detail as order confirmation page

The system SHALL treat the order detail page as the order confirmation page after checkout.

#### Scenario: Post-checkout redirect shows confirmation
- **WHEN** a customer completes checkout and is redirected to `/orders/{order_id}`
- **THEN** the page SHALL display a success banner: "¡Pedido confirmado!" with the order ID
- **AND** show all order details as described above

### Requirement: Order detail shows delivery address

The system SHALL display the delivery address associated with the order.

#### Scenario: Order with delivery address
- **WHEN** an order has an associated delivery address
- **THEN** the page SHALL display the full address (street, number, city, postal code)

### Requirement: Post-checkout success banner with animated checkmark

The order detail page SHALL display a success banner with an animated checkmark when visited immediately after checkout.

#### Scenario: Success banner on post-checkout redirect
- **WHEN** a customer completes checkout and is redirected to `/orders/{order_id}`
- **THEN** the page SHALL display a success banner: "¡Pedido confirmado!" with an animated checkmark
- **AND** the banner SHALL use the Mesa brand green or accent color for the checkmark
- **AND** the banner SHALL have a subtle fade-out or remain dismissible

### Requirement: Mesa-styled status timeline component

The system SHALL render the order status timeline using Mesa Design System styling.

#### Scenario: Status timeline with Mesa styling
- **WHEN** a customer views an order detail page
- **THEN** the status timeline SHALL use Mesa Design System typography tokens
- **AND** completed steps SHALL be marked with a check icon in brand color
- **AND** the current step SHALL be highlighted with a pulse animation
- **AND** pending steps SHALL be grayed out

### Requirement: Mesa-styled item list

The order detail page SHALL display the order items list with Mesa typography tokens.

#### Scenario: Item list with Mesa typography
- **WHEN** a customer views an order detail page
- **THEN** each line item SHALL be displayed with proper Mesa typography tokens (Inter Tight for names, Inter for details)
- **AND** product names SHALL use the `.t-display` or heading style
- **AND** prices SHALL use the `.num` class for numeric styling
- **AND** quantities SHALL be displayed as chips

### Requirement: Payment status card with Mesa styling

The order detail page SHALL display the payment status card using Mesa Design System styling.

#### Scenario: Payment card with Mesa styling
- **WHEN** a customer views an order detail page
- **THEN** the payment information SHALL be displayed in a Mesa-styled card
- **AND** the payment method SHALL use brand accent styling
- **AND** the payment status badge SHALL use Mesa color variants: soft (pendiente), leaf (aprobado), red (rechazado)

### Requirement: Order detail SHALL show status timeline

**Old:** (none — new requirement)

**New:** The system SHALL display a status timeline on the order detail page with animated checkmarks for completed steps and pending indicators for future steps.

#### Scenario: Order progress displays as timeline
- **WHEN** the user opens an order detail
- **THEN** a status timeline SHALL display with animated checkmarks for completed steps

### Requirement: Order detail SHALL show item list

**Old:** (none — new requirement)

**New:** The system SHALL display each ordered item as a Mesa-styled card with product image, name, quantity, and price on the order detail page.

#### Scenario: Order items display in Mesa card style
- **WHEN** the user views order details
- **THEN** each ordered item SHALL display as a Mesa-styled card with quantity and price

