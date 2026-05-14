# admin-panel Specification (Delta)

## Purpose
Delta spec for admin panel changes — adds frontend requirements for admin order management (list, detail, status updates).

## ADDED Requirements

### Requirement: Admin orders list page

The admin panel SHALL provide a page at `/admin/orders` listing ALL orders across all users with pagination, filtering, and sorting.

#### Scenario: Orders list renders with pagination
- **WHEN** an admin navigates to `/admin/orders`
- **THEN** the system SHALL display a paginated table of all orders
- **AND** the table SHALL show columns: ID (truncated UUID), Cliente (nombre + email), Estado (colored badge), Total (formatted with `$`), Fecha de creación (formatted datetime), Acciones
- **AND** pagination controls SHALL show at the bottom (Previous/Next, page numbers, total count)

#### Scenario: Filter orders by status
- **WHEN** an admin selects a status filter (e.g., "pendiente")
- **THEN** the table SHALL only show orders with that status
- **AND** the URL SHALL update to reflect the filter (`/admin/orders?estado=pendiente`)

#### Scenario: Filter orders by date range
- **WHEN** an admin selects a date range using date picker inputs
- **THEN** the table SHALL only show orders within that date range
- **AND** the API call SHALL include `desde` and `hasta` query parameters

#### Scenario: Search orders by client name
- **WHEN** an admin types in a search input
- **THEN** the table SHALL filter orders by client name or email (client-side debounced search)

#### Scenario: Quick action — view order detail
- **WHEN** an admin clicks "Ver" on an order row
- **THEN** the system SHALL navigate to `/admin/orders/{id}`

#### Scenario: Quick action — update status
- **WHEN** an admin clicks the status badge or an "Estado" button
- **THEN** a dropdown or modal SHALL show the available valid transitions for that order's current status
- **AND** selecting a new status SHALL call `PATCH /pedidos/{id}/status`
- **AND** the table SHALL refresh to show the updated status

#### Scenario: Loading state
- **WHEN** the orders list is loading
- **THEN** a table skeleton SHALL be displayed with placeholder rows

#### Scenario: Empty state
- **WHEN** no orders match the current filters
- **THEN** the system SHALL display "No se encontraron pedidos" with an illustration and a "Limpiar filtros" button

#### Scenario: Error state
- **WHEN** the API call fails
- **THEN** the system SHALL display an error message with a "Reintentar" button

### Requirement: Admin order detail page

The admin panel SHALL provide a detail page at `/admin/orders/:id` with full order information.

#### Scenario: Order detail shows customer info
- **WHEN** an admin views an order detail
- **THEN** the page SHALL display customer information: name, email, and delivery address
- **AND** a "Ver cliente" link SHALL navigate to customer management (future)

#### Scenario: Order detail shows order info
- **WHEN** an admin views an order detail
- **THEN** the page SHALL display: Order ID (full UUID), Status (colored badge), Created date, Total amount
- **AND** the status badge SHALL be clickable to change status

#### Scenario: Order detail shows order items
- **WHEN** an admin views an order detail
- **THEN** a table SHALL list all items with: Product name, Quantity, Unit price, Subtotal
- **AND** the total row SHALL show the sum of all subtotals

#### Scenario: Order detail shows payment info
- **WHEN** an admin views an order detail
- **THEN** the payment section SHALL display: Payment status (colored badge), Payment method, Amount
- **AND** if the order is `pendiente`, a "Registrar pago" button MAY be shown (deferred to payment integration)

#### Scenario: Order detail shows status timeline
- **WHEN** an admin views an order detail
- **THEN** the `OrderTimeline` component SHALL display the order's status history
- **AND** the timeline SHALL show each transition with: old status, new status, who changed it, timestamp, and reason (if provided)

#### Scenario: Order detail shows full history
- **WHEN** an admin views an order detail
- **THEN** the `OrderHistory` component SHALL display the complete audit trail from `GET /pedidos/{id}/history`
- **AND** the history SHALL be sorted chronologically (oldest first)

#### Scenario: Change order status from detail
- **WHEN** an admin clicks "Cambiar Estado" on the order detail page
- **THEN** a modal SHALL open showing valid target states for the current status
- **AND** the modal SHALL include a text field for "Razón del cambio" (optional)
- **AND** upon confirmation, the system SHALL call `PATCH /pedidos/{id}/status`
- **AND** the page SHALL refresh to reflect the new status and history

#### Scenario: Loading state
- **WHEN** the order detail is loading
- **THEN** a full-page skeleton SHALL be displayed

#### Scenario: Error state
- **WHEN** the order ID does not exist
- **THEN** the system SHALL display "Pedido no encontrado" with a "Volver a pedidos" link

### Requirement: Admin order status change modal

The admin panel SHALL provide a consistent modal component for changing order status.

#### Scenario: Status modal shows valid transitions
- **WHEN** an admin opens the change status modal for an order in `confirmado` status
- **THEN** the modal SHALL show only valid target states: `preparando`, `cancelado`
- **AND** SHALL NOT show invalid target states (e.g., `pendiente`, `entregado`)

#### Scenario: Status modal confirms action
- **WHEN** an admin selects a new status and optionally enters a reason
- **THEN** a confirmation step SHALL show a summary: "¿Cambiar estado de [current] a [new]?"
- **AND** upon confirming, the API call SHALL be made

#### Scenario: Status change success feedback
- **WHEN** the status change API call succeeds
- **THEN** a success toast/notification SHALL appear
- **AND** the UI SHALL immediately reflect the new status

#### Scenario: Status change error feedback
- **WHEN** the status change API call fails (e.g., invalid transition)
- **THEN** an error toast SHALL appear with the error message from the API
- **AND** the modal SHALL remain open for retry
