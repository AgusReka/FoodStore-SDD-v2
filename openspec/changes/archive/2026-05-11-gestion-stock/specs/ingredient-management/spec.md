# ingredient-management Specification (Delta)

## ADDED Requirements

### Requirement: Ingredient has stock tracking

The system SHALL support tracking current stock and minimum stock alert levels for each ingredient.

#### Scenario: Create ingredient with stock fields
- **WHEN** a POST request is sent to `/api/v1/ingredientes` with `nombre`, `unidad_medida`, `stock_actual`, and `stock_minimo`
- **THEN** a new ingredient SHALL be created with the specified stock values

#### Scenario: Update ingredient stock
- **WHEN** a PATCH request is sent to `/api/v1/ingredientes/{id}` with `stock_actual` or `stock_minimo`
- **THEN** the ingredient's stock fields SHALL be updated

#### Scenario: Get ingredient includes stock info
- **WHEN** a GET request is sent to `/api/v1/ingredientes/{id}`
- **THEN** the response SHALL include `stock_actual`, `stock_minimo`, and `stock_suficiente` (boolean)

#### Scenario: List ingredients includes stock info
- **WHEN** a GET request is sent to `/api/v1/ingredientes`
- **THEN** each ingredient in the response SHALL include `stock_actual`, `stock_minimo`, and `stock_suficiente`

### Requirement: Filter ingredients by stock status

The system SHALL support filtering ingredients by stock status.

#### Scenario: Filter ingredients with low stock
- **WHEN** a GET request is sent to `/api/v1/ingredientes?stock_bajo=true`
- **THEN** only ingredients where `stock_actual < stock_minimo` SHALL be returned

## MODIFIED Requirements

### Requirement: Create Ingredient

The system SHALL support creating a new ingredient with name, description, unit of measure, optional image URL, stock_actual, and stock_minimo.

#### Scenario: Create ingredient successfully
- **WHEN** a POST request is sent to `/api/v1/ingredientes` with valid `nombre`, `descripcion` (optional), `unidad_medida`, `imagen_url` (optional), `stock_actual`, and `stock_minimo`
- **THEN** a new ingredient SHALL be created and returned with status 201

#### Scenario: Create ingredient with duplicate name
- **WHEN** a POST request is sent with a `nombre` that already exists
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Update Ingredient

The system SHALL support updating an ingredient's name, description, unit, image, stock_actual, and stock_minimo.

#### Scenario: Update ingredient stock values
- **WHEN** a PATCH request is sent to `/api/v1/ingredientes/{id}` with `stock_actual: 15.5`
- **THEN** the ingredient's `stock_actual` SHALL be updated to 15.5
- **AND** `stock_suficiente` SHALL be recalculated
