# product-catalog Specification (Delta)

## ADDED Requirements

### Requirement: Product lists available stock

The system SHALL expose the calculated available stock for each product in read responses.

#### Scenario: Get product includes stock info
- **WHEN** a GET request is sent to `/api/v1/productos/{id}`
- **THEN** the response SHALL include `stock_cantidad` (direct stock, may be null) and `stock_disponible` (calculated available units)

#### Scenario: List products includes stock info
- **WHEN** a GET request is sent to `/api/v1/productos`
- **THEN** each product in the response SHALL include `stock_disponible`

## MODIFIED Requirements

### Requirement: Product CRUD

The system SHALL support creating, reading, updating, and deleting products with stock information.

**Scenarios:**

#### Scenario: Create product
- **WHEN** a POST request is sent to `/api/v1/productos` with `nombre`, `descripcion`, `precio`, `stock_cantidad`, and `categoria_id`
- **THEN** a new product SHALL be created with status 201

#### Scenario: Create product with non-existent category
- **WHEN** a POST request is sent with a `categoria_id` that does not exist
- **THEN** the system SHALL return a 404 Not Found error

#### Scenario: Get product by ID
- **WHEN** a GET request is sent to `/api/v1/productos/{id}`
- **THEN** the matching product SHALL be returned with `stock_cantidad` and `stock_disponible`

#### Scenario: Update product stock
- **WHEN** a PATCH request is sent to `/api/v1/productos/{id}` with `stock_cantidad`
- **THEN** the product's stock SHALL be updated
