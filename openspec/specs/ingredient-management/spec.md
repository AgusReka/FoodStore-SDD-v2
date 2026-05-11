# ingredient-management Specification

## Purpose
TBD - created by archiving change ingredients-crud. Update Purpose after archive.
## Requirements
### Requirement: Create Ingredient

The system SHALL support creating a new ingredient with name, description, unit of measure, optional image URL, stock_actual, and stock_minimo.

#### Scenario: Create ingredient successfully
- **WHEN** a POST request is sent to `/api/v1/ingredientes` with valid `nombre`, `descripcion` (optional), `unidad_medida`, `imagen_url` (optional), `stock_actual`, and `stock_minimo`
- **THEN** a new ingredient SHALL be created and returned with status 201

#### Scenario: Create ingredient with duplicate name
- **WHEN** a POST request is sent with a `nombre` that already exists
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: List Ingredients
The system SHALL support listing ingredients with pagination and search by name.

#### Scenario: List all ingredients
- **WHEN** a GET request is sent to `/api/v1/ingredientes`
- **THEN** a paginated list of ingredients SHALL be returned

#### Scenario: Search ingredients by name
- **WHEN** a GET request is sent to `/api/v1/ingredientes?search=harina`
- **THEN** ingredients whose `nombre` contains "harina" (case-insensitive) SHALL be returned

#### Scenario: Paginate ingredients
- **WHEN** a GET request is sent to `/api/v1/ingredientes?page=2&size=10`
- **THEN** the system SHALL return the second page with up to 10 ingredients

### Requirement: Get Ingredient by ID
The system SHALL support retrieving a single ingredient by its ID.

#### Scenario: Get existing ingredient
- **WHEN** a GET request is sent to `/api/v1/ingredientes/{id}`
- **THEN** the matching ingredient SHALL be returned

#### Scenario: Get non-existent ingredient
- **WHEN** a GET request is sent to `/api/v1/ingredientes/{id}` and the ingredient does not exist
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Update Ingredient

The system SHALL support updating an ingredient's name, description, unit, image, stock_actual, and stock_minimo.

#### Scenario: Update ingredient stock values
- **WHEN** a PATCH request is sent to `/api/v1/ingredientes/{id}` with `stock_actual: 15.5`
- **THEN** the ingredient's `stock_actual` SHALL be updated to 15.5
- **AND** `stock_suficiente` SHALL be recalculated

### Requirement: Delete Ingredient
The system SHALL support deleting an ingredient.

#### Scenario: Delete ingredient with no associated products
- **WHEN** a DELETE request is sent to `/api/v1/ingredientes/{id}` and the ingredient has no associated products
- **THEN** the ingredient SHALL be deleted with status 204

#### Scenario: Delete ingredient with associated products
- **WHEN** a DELETE request is sent to `/api/v1/ingredientes/{id}` and the ingredient is used by one or more products
- **THEN** the system SHALL return a 409 Conflict error

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

