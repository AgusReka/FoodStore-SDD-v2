# customer-order-history delta spec

## ADDED Requirements

### Requirement: Customer can filter orders by period

The system SHALL support filtering the order history by predefined time periods (last week, last month, last 3 months, all).

#### Scenario: Period filter pills displayed
- **WHEN** an authenticated customer navigates to `/orders`
- **THEN** the page SHALL display a row of period filter pills: "Última semana", "Último mes", "Últimos 3 meses", "Todas"
- **AND** "Todas" SHALL be selected by default

#### Scenario: Filter by period
- **WHEN** a customer clicks "Última semana" period pill
- **THEN** the page SHALL re-fetch orders with `periodo=last_week` query parameter
- **AND** display only orders created in the last 7 days

#### Scenario: Period filter resets pagination
- **WHEN** a customer changes the period filter while on a non-first page
- **THEN** the page SHALL reset to page 1

#### Scenario: Period filter with no results
- **WHEN** a customer selects a period filter with no matching orders
- **THEN** the page SHALL display the empty state message

### Requirement: Backend supports period parameter

The system SHALL accept a `periodo` query parameter on the `GET /pedidos/` endpoint to filter orders by creation date range.

#### Scenario: API accepts periodo parameter
- **WHEN** a customer sends `GET /api/v1/pedidos/?periodo=last_month&page=1&size=10`
- **THEN** the system SHALL return only orders with `created_at >= (now - 30 days)`
- **AND** the count SHALL reflect only matching orders

#### Scenario: Default periodo is "all"
- **WHEN** a customer sends `GET /api/v1/pedidos/` without a `periodo` parameter
- **THEN** the system SHALL return all orders (no date filter)
