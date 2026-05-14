# admin-panel Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Admin authorization

Admin endpoints SHALL use the centralized `require_permission()` dependency for access control instead of ad-hoc role checks.

**Original requirement from base spec (replaced):**
> All admin endpoints SHALL require the authenticated user to have role `admin`. Non-admin requests SHALL be rejected.

**Updated requirement:**
All admin endpoints SHALL use the centralized `require_permission()` dependency instead of ad-hoc role checks. Each admin endpoint SHALL require the appropriate granular permission (not just `role == admin`).

#### Scenario: Admin access granted via permission
- **WHEN** a user with `user:list` permission accesses `/api/v1/admin/usuarios`
- **THEN** the request SHALL be processed normally

#### Scenario: Access without required permission
- **WHEN** a manager (who has `product:*` but not `user:*` permissions) accesses `/api/v1/admin/usuarios`
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Non-admin role with explicit permission
- **WHEN** a user with `order:list_all` permission (via a `support` role) accesses `/api/v1/admin/pedidos`
- **THEN** the request SHALL be processed

---

### Requirement: List all users

The system SHALL support admin listing of all users with pagination and filtering.

**Scenarios:**

#### Scenario: Admin lists all users
- **WHEN** a GET request is sent to `/api/v1/admin/usuarios`
- **THEN** a paginated list of ALL users (not just the requester's) SHALL be returned

### Requirement: Update user role

The system SHALL allow admins to change a user's role.

**Scenarios:**

#### Scenario: Promote user to admin
- **WHEN** a PATCH request is sent to `/api/v1/admin/usuarios/{id}/role` with `role: "admin"`
- **THEN** the user's role SHALL be updated to `admin`

#### Scenario: Demote admin to cliente
- **WHEN** a PATCH request is sent to `/api/v1/admin/usuarios/{id}/role` with `role: "cliente"`
- **THEN** the user's role SHALL be updated to `cliente`

### Requirement: View all orders

The system SHALL allow admins to view all orders across all users.

**Scenarios:**

#### Scenario: Admin views all orders
- **WHEN** a GET request is sent to `/api/v1/admin/pedidos`
- **THEN** orders from ALL users SHALL be returned with pagination

### Requirement: Admin endpoint permission mapping

The following admin endpoints SHALL require these specific permissions:

#### Scenario: List users permission
- **WHEN** accessing `GET /api/v1/admin/usuarios`
- **THEN** permission `user:list` SHALL be required

#### Scenario: Change user role permission
- **WHEN** accessing `PATCH /api/v1/admin/usuarios/{id}/role`
- **THEN** permission `user:change_role` SHALL be required

#### Scenario: List all orders permission
- **WHEN** accessing `GET /api/v1/admin/pedidos`
- **THEN** permission `order:list_all` SHALL be required

### Requirement: Admin can view stock alerts

The admin panel SHALL include a stock alerts view showing ingredients that are below their minimum stock level.

#### Scenario: Navigate to stock alerts
- **WHEN** an admin clicks "Alertas de Stock" in the sidebar
- **THEN** the system SHALL display a table of ingredients where `stock_actual < stock_minimo`

#### Scenario: Stock alerts table columns
- **WHEN** the stock alerts table is displayed
- **THEN** it SHALL show columns: Ingredient name, Unit, Current stock, Minimum stock, Products affected, and Action

#### Scenario: Sort alerts by severity
- **WHEN** the stock alerts table loads
- **THEN** ingredients SHALL be sorted by severity: `(stock_minimo - stock_actual) / stock_minimo` descending (most critical first)

#### Scenario: Empty stock alerts state
- **WHEN** all ingredients have `stock_actual >= stock_minimo`
- **THEN** the view SHALL display a success message "Todos los ingredientes tienen stock suficiente"

#### Scenario: Edit ingredient from alert
- **WHEN** an admin clicks "Reponer" on a stock alert row
- **THEN** the system SHALL navigate to the ingredient edit form with `stock_actual` focused

### Requirement: Admin sidebar shows stock alert badge

The admin sidebar SHALL show a notification badge on the "Alertas de Stock" link when there are ingredients below minimum stock.

#### Scenario: Badge visible with count
- **WHEN** there are 3 ingredients below minimum stock
- **THEN** the sidebar SHALL show "Alertas de Stock (3)" with a visual badge

#### Scenario: No badge when all stock is OK
- **WHEN** all ingredients have sufficient stock
- **THEN** the sidebar SHALL show "Alertas de Stock" without a badge

### Requirement: Admin layout renders independently
The admin panel SHALL render as a standalone layout with its own sidebar navigation, independent of the customer layout.

#### Scenario: Admin page has independent DOM tree
- **WHEN** an admin navigates to `/admin`
- **THEN** the page SHALL render `AdminPage` as the root layout element
- **AND** the page SHALL NOT be wrapped by the customer `Layout` component
- **AND** the admin sidebar SHALL be the only navigation element

#### Scenario: Admin sidebar "Volver a la tienda" navigates correctly
- **WHEN** an admin clicks "← Volver a la tienda" in the admin sidebar
- **THEN** the system SHALL navigate to `/`
- **AND** the customer `<Header />` SHALL appear on the destination page

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

