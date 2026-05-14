# admin-dashboard-metrics Specification

## Purpose
TBD - created by archiving change admin-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Dashboard shows KPI summary cards

The admin dashboard SHALL display a row of summary cards showing key business metrics at a glance.

#### Scenario: KPI cards render with data
- **WHEN** an admin navigates to `/admin`
- **THEN** the dashboard SHALL display the following KPI cards:
  - Órdenes Hoy — total de pedidos creados hoy
  - Órdenes Pendientes — total de pedidos en estado `pendiente`
  - Ingresos Hoy — suma total de ingresos de pedidos confirmados hoy
  - Productos Vendidos Hoy — cantidad total de unidades vendidas hoy

#### Scenario: KPI cards show loading state
- **WHEN** the dashboard is loading KPI data
- **THEN** each card SHALL display a skeleton loader animation

#### Scenario: KPI cards show error state
- **WHEN** the KPI data fetch fails
- **THEN** the cards SHALL display a retry message with a "Reintentar" button

#### Scenario: KPI card content
- **WHEN** a KPI card is rendered with data
- **THEN** it SHALL show: a label, the metric value (formatted: numbers with commas, currency with `$` prefix), a trend indicator (up/down arrow with percentage vs yesterday), and an icon representing the metric type
- **AND** the card SHALL use a subtle background color matching its icon

### Requirement: Dashboard shows orders by status chart

The dashboard SHALL include a chart showing the distribution of orders by status.

#### Scenario: Orders by status pie chart
- **WHEN** the dashboard loads
- **THEN** a pie/donut chart SHALL display the count of orders grouped by each status (`pendiente`, `confirmado`, `preparando`, `enviado`, `entregado`, `cancelado`)
- **AND** each status segment SHALL have a distinct color
- **AND** hovering over a segment SHALL show a tooltip with the status name and count

#### Scenario: Empty orders chart state
- **WHEN** there are no orders in the system
- **THEN** the chart area SHALL display "No hay pedidos registrados" with an empty state illustration

### Requirement: Dashboard shows recent orders table

The dashboard SHALL display a compact table of the 5 most recent orders.

#### Scenario: Recent orders table renders
- **WHEN** the dashboard loads
- **THEN** a table SHALL show the 5 most recent orders with columns: ID, Cliente, Estado, Total, Fecha
- **AND** each status SHALL be displayed as a colored badge
- **AND** clicking a row SHALL navigate to `/admin/orders/{id}`

#### Scenario: Recent orders empty state
- **WHEN** there are no recent orders
- **THEN** the table area SHALL display "No hay pedidos recientes"

### Requirement: Dashboard shows top selling products

The dashboard SHALL display a ranking of the top 5 most sold products.

#### Scenario: Top products bar chart
- **WHEN** the dashboard loads
- **THEN** a horizontal bar chart SHALL show the top 5 products by quantity sold
- **AND** each bar SHALL show the product name and total quantity sold
- **AND** bars SHALL be sorted descending by quantity

#### Scenario: No products sold yet
- **WHEN** there are no completed orders
- **THEN** the chart area SHALL display "No hay productos vendidos aún"

### Requirement: Dashboard is responsive

The dashboard layout SHALL adapt to different screen sizes.

#### Scenario: Desktop layout
- **WHEN** viewed on a screen >= 1024px wide
- **THEN** KPI cards SHALL be displayed in a 4-column grid
- **AND** charts and tables SHALL be displayed side by side in a 2-column grid

#### Scenario: Tablet layout
- **WHEN** viewed on a screen between 768px and 1023px wide
- **THEN** KPI cards SHALL be displayed in a 2-column grid
- **AND** charts SHALL stack vertically

#### Scenario: Mobile layout
- **WHEN** viewed on a screen < 768px wide
- **THEN** KPI cards SHALL be displayed in a single column
- **AND** all content SHALL stack vertically with full width

