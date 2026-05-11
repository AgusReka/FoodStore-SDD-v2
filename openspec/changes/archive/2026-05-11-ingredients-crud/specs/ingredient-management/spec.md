## ADDED Requirements

### Requirement: Create Ingredient
The system SHALL support creating a new ingredient with name, description, unit of measure, and optional image URL.

#### Scenario: Create ingredient successfully
- **WHEN** a POST request is sent to `/api/v1/ingredientes` with valid `nombre`, `descripcion` (optional), `unidad_medida`, and `imagen_url` (optional)
- **THEN** a new ingredient SHALL be created and returned with status 201

#### Scenario: Create ingredient with duplicate name
- **WHEN** a POST request is sent with a `nombre` that already exists
- **THEN** the system SHALL return a 409 Conflict error

#### Scenario: Create ingredient without authentication
- **WHEN** a POST request is sent without a valid JWT token
- **THEN** the system SHALL return a 401 Unauthorized error

#### Scenario: Create ingredient without admin permissions
- **WHEN** a POST request is sent by a non-admin user
- **THEN** the system SHALL return a 403 Forbidden error

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
The system SHALL support updating an ingredient's name, description, unit of measure, and image URL.

#### Scenario: Update ingredient successfully
- **WHEN** a PATCH request is sent to `/api/v1/ingredientes/{id}` with valid fields
- **THEN** the ingredient SHALL be updated and returned

#### Scenario: Update non-existent ingredient
- **WHEN** a PATCH request is sent to `/api/v1/ingredientes/{id}` and the ingredient does not exist
- **THEN** the system SHALL return a 404 Not Found error

#### Scenario: Update ingredient to duplicate name
- **WHEN** a PATCH request is sent with a `nombre` that already exists on another ingredient
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Delete Ingredient
The system SHALL support deleting an ingredient.

#### Scenario: Delete ingredient with no associated products
- **WHEN** a DELETE request is sent to `/api/v1/ingredientes/{id}` and the ingredient has no associated products
- **THEN** the ingredient SHALL be deleted with status 204

#### Scenario: Delete ingredient with associated products
- **WHEN** a DELETE request is sent to `/api/v1/ingredientes/{id}` and the ingredient is used by one or more products
- **THEN** the system SHALL return a 409 Conflict error
