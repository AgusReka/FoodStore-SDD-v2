# admin-layout Specification (Delta)

## Purpose
Delta spec — adds "Pedidos" to the admin sidebar navigation with badge for pending orders count.

## MODIFIED Requirements

### Requirement: Admin sidebar remains unchanged

The admin sidebar SHALL continue to function as before — same navigation items, same badge on stock alerts, same "Volver a la tienda" link.

#### Scenario: Admin sidebar navigation items
- **WHEN** an admin views the sidebar
- **THEN** the sidebar SHALL show: Dashboard, Categorías, Ingredientes, Productos, Pedidos, Alertas de Stock
- **AND** SHALL show the stock alert badge when alerts exist
- **AND** SHALL show "← Volver a la tienda" link at the bottom

## ADDED Requirements

### Requirement: Sidebar badge for pending orders

The sidebar SHALL show a notification badge on the "Pedidos" link when there are orders in `pendiente` status.

#### Scenario: Badge visible with pending order count
- **WHEN** there are 5 orders in `pendiente` status
- **THEN** the sidebar SHALL show "Pedidos (5)" with a visual badge (orange/amber color to distinguish from stock alert red badge)

#### Scenario: No badge when no pending orders
- **WHEN** there are zero orders in `pendiente` status
- **THEN** the sidebar SHALL show "Pedidos" without a badge

#### Scenario: Badge auto-refreshes
- **WHEN** the pending orders count changes
- **THEN** the badge SHALL update within a reasonable polling interval (every 60 seconds) or on navigation
