# admin-panel Specification (Delta)

## ADDED Requirements

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
