# stock-management Specification

## Purpose
TBD - created by archiving change gestion-stock. Update Purpose after archive.
## Requirements
### Requirement: Productos simples tienen stock directo

The system SHALL support a `stock_cantidad` field on Product for products without ingredients.

**Scenarios:**

#### Scenario: Crear producto simple con stock
- **WHEN** a POST request is sent to `/api/v1/productos` with `ingredientes: null` and `stock_cantidad: 50`
- **THEN** the product SHALL be created with `stock_cantidad: 50`

#### Scenario: Crear producto compuesto sin stock directo
- **WHEN** a POST request is sent to `/api/v1/productos` with `ingredientes: [...]` and `stock_cantidad: null`
- **THEN** the product SHALL be created with `stock_cantidad: null`

#### Scenario: Stock directo se descuenta al confirmar pedido
- **WHEN** a pedido containing a simple product is confirmed
- **THEN** the product's `stock_cantidad` SHALL be decremented by the ordered quantity

#### Scenario: Stock directo no puede ser negativo post-confirmación
- **WHEN** a confirm request would cause `stock_cantidad` to go below 0
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Ingredientes tienen stock

The system SHALL support `stock_actual` and `stock_minimo` fields on Ingredient for inventory tracking.

**Scenarios:**

#### Scenario: Crear ingrediente con stock inicial
- **WHEN** a POST request is sent to `/api/v1/ingredientes` with `stock_actual: 10` and `stock_minimo: 2`
- **THEN** the ingredient SHALL be created with those stock values

#### Scenario: Stock de ingrediente se descuenta al confirmar pedido
- **WHEN** a pedido containing a product with ingredients is confirmed
- **THEN** each ingredient's `stock_actual` SHALL be decremented by `ProductIngredient.cantidad * ordered_quantity`

#### Scenario: Stock de ingrediente no puede ser negativo
- **WHEN** a confirm request would cause any ingredient's `stock_actual` to go below 0
- **THEN** the system SHALL return a 409 Conflict error with the ingredient name

#### Scenario: Stock se libera al cancelar pedido confirmado
- **WHEN** a pedido in CONFIRMADO status is cancelled
- **THEN** all previously decremented stock SHALL be restored (ingredient `stock_actual` incremented, product `stock_cantidad` incremented)

### Requirement: Cálculo de stock disponible

The system SHALL calculate available stock differently based on product type.

**Scenarios:**

#### Scenario: Stock disponible de producto simple
- **WHEN** querying stock for a product with `stock_cantidad: 30` and no ingredients
- **THEN** the available stock SHALL be 30

#### Scenario: Stock disponible de producto compuesto
- **WHEN** querying stock for a product with ingredients (Queso: 0.5kg needed, 10kg stock → 20 units; Tomate: 0.2kg needed, 5kg stock → 25 units)
- **THEN** the available stock SHALL be 20 (the minimum of all ingredient calculations)

### Requirement: Alertas de stock mínimo

The system SHALL support alerts when ingredient stock falls below the configured minimum.

**Scenarios:**

#### Scenario: Ingrediente por debajo del mínimo
- **WHEN** an ingredient's `stock_actual` is 1 and `stock_minimo` is 5
- **THEN** the system SHALL flag this ingredient as "stock bajo"

#### Scenario: Listar alertas de stock
- **WHEN** a GET request is sent to `/api/v1/admin/stock-alerts`
- **THEN** the system SHALL return a list of all ingredients where `stock_actual < stock_minimo`, ordered by severity

