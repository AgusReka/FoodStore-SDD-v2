# frontend-routing Specification (Delta)

## Purpose
Delta spec — adds admin orders routes `/admin/orders` and `/admin/orders/:id`.

## ADDED Requirements

### Requirement: Admin orders routes defined

The frontend SHALL define routes for the admin orders management pages under the admin layout.

#### Scenario: Admin orders list route
- **WHEN** the developer inspects the route configuration
- **THEN** the route `/admin/orders` SHALL be defined inside the admin `<Route>` block
- **AND** it SHALL render the admin orders list page component
- **AND** it SHALL be a child of the `AdminPage` layout (renders inside `<Outlet />`)

#### Scenario: Admin order detail route
- **WHEN** the developer inspects the route configuration
- **THEN** the route `/admin/orders/:id` SHALL be defined inside the admin `<Route>` block
- **AND** it SHALL render the admin order detail page component
- **AND** the `:id` parameter SHALL be the order UUID

#### Scenario: Route order matches sidebar
- **WHEN** the developer inspects the route configuration
- **THEN** the admin orders route SHALL be placed after products and before stock-alerts, matching the sidebar navigation order
