## ADDED Requirements

### Requirement: Product lists ingredients
The system SHALL support associating ingredients with a product, including quantity per ingredient.

#### Scenario: Create product with ingredients
- **WHEN** a POST request is sent to `/api/v1/productos` with `ingredientes` containing a list of `{ingredient_id, cantidad}`
- **THEN** the product SHALL be created with the specified ingredient associations

#### Scenario: Get product includes ingredients
- **WHEN** a GET request is sent to `/api/v1/productos/{id}`
- **THEN** the response SHALL include an `ingredientes` array with each ingredient's id, name, and quantity

#### Scenario: Update product ingredients
- **WHEN** a PATCH request is sent to `/api/v1/productos/{id}` with updated `ingredientes`
- **THEN** the product's ingredient associations SHALL be replaced with the new list
