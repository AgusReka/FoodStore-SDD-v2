# customer-order-history Specification

## Purpose
TBD - created by archiving change customer-orders. Update Purpose after archive.
## Requirements
### Requirement: Customer can view paginated order history

The system SHALL provide a dedicated `/orders` page that displays the authenticated customer's past orders in a paginated list, sorted by most recent first.

#### Scenario: Order history shows paginated list of orders
- **WHEN** an authenticated customer navigates to `/orders`
- **THEN** the system SHALL fetch orders from `GET /api/v1/pedidos/` with pagination
- **AND** display each order as a card showing: order ID (last 8 chars), status, total, date, item count
- **AND** show the most recent orders first

#### Scenario: Empty order history
- **WHEN** an authenticated customer with no orders navigates to `/orders`
- **THEN** the page SHALL display a friendly empty state: "No tenés pedidos todavía"
- **AND** a "Ver productos" button that navigates to the home page

#### Scenario: Loading state for order history
- **WHEN** the orders are being fetched
- **THEN** the page SHALL display skeleton placeholders for each order card

#### Scenario: Error state for order history
- **WHEN** the orders fetch fails due to network error
- **THEN** the page SHALL display an error message with a "Reintentar" button

### Requirement: Customer can filter orders by status

The system SHALL support filtering the order history by order status via the backend `?estado=` query parameter.

#### Scenario: Filter orders by status
- **WHEN** a customer clicks a status filter tab (e.g., "Pendientes", "Confirmados", "Entregados")
- **THEN** the page SHALL re-fetch orders filtered by that status
- **AND** display only matching orders

#### Scenario: Filter with no results
- **WHEN** a customer selects a status filter with no matching orders
- **THEN** the page SHALL display a message: "No tenés pedidos con ese estado"

### Requirement: Customer can navigate to order detail from history

The system SHALL let the customer click any order card to see its full details.

#### Scenario: Click order card navigates to detail
- **WHEN** a customer clicks an order card in the history list
- **THEN** the system SHALL navigate to `/orders/{order_id}`

### Requirement: Order history supports pagination

The system SHALL support pagination for the order history, with configurable page size.

#### Scenario: Navigate to next page
- **WHEN** a customer has more orders than the current page size
- **THEN** a "Siguiente" button SHALL appear at the bottom of the list
- **AND** clicking it SHALL load the next page of results

#### Scenario: Navigate to previous page
- **WHEN** a customer is on page 2 or later
- **THEN** an "Anterior" button SHALL appear
- **AND** clicking it SHALL load the previous page of results

