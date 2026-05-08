# product-catalog Specification

## Purpose
TBD - created by archiving change backend-patterns. Update Purpose after archive.
## Requirements
### Requirement: Category CRUD

The system SHALL support creating, reading, updating, and deleting categories.

**Scenarios:**

#### Scenario: Create category
- **WHEN** a POST request is sent to `/api/v1/categorias` with valid `nombre` and optional `descripcion`
- **THEN** a new category SHALL be created and returned with status 201

#### Scenario: List all categories
- **WHEN** a GET request is sent to `/api/v1/categorias`
- **THEN** a list of all categories SHALL be returned

#### Scenario: Update category
- **WHEN** a PATCH request is sent to `/api/v1/categorias/{id}` with updated fields
- **THEN** the category SHALL be updated

#### Scenario: Delete category with no products
- **WHEN** a DELETE request is sent to `/api/v1/categorias/{id}` and the category has no associated products
- **THEN** the category SHALL be deleted with status 204

#### Scenario: Delete category with products
- **WHEN** a DELETE request is sent to `/api/v1/categorias/{id}` and the category has associated products
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Product CRUD

The system SHALL support creating, reading, updating, and deleting products.

**Scenarios:**

#### Scenario: Create product
- **WHEN** a POST request is sent to `/api/v1/productos` with `nombre`, `descripcion`, `precio`, `stock`, and `categoria_id`
- **THEN** a new product SHALL be created with status 201

#### Scenario: Create product with non-existent category
- **WHEN** a POST request is sent with a `categoria_id` that does not exist
- **THEN** the system SHALL return a 404 Not Found error

#### Scenario: Get product by ID
- **WHEN** a GET request is sent to `/api/v1/productos/{id}`
- **THEN** the matching product SHALL be returned

### Requirement: List products with filters

The system SHALL support listing products with pagination, filtering by category, and searching by name.

**Scenarios:**

#### Scenario: List all products
- **WHEN** a GET request is sent to `/api/v1/productos`
- **THEN** a paginated list of products SHALL be returned

#### Scenario: Filter by category
- **WHEN** a GET request is sent to `/api/v1/productos?categoria_id={id}`
- **THEN** only products in that category SHALL be returned

#### Scenario: Search by name
- **WHEN** a GET request is sent to `/api/v1/productos?search=pizza`
- **THEN** products whose `nombre` contains "pizza" (case-insensitive) SHALL be returned

