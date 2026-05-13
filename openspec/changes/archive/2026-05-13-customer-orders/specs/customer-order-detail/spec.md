# Spec: customer-order-detail

## Overview
Customer-facing order detail page showing full order information, line items, status timeline, payment details, and delivery address.

## ADDED Requirements

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
