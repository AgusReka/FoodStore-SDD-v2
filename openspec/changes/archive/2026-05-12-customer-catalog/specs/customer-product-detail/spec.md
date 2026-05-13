## ADDED Requirements

### Requirement: Customer can view product detail page

The system SHALL provide a dedicated product detail page at `/productos/:id` showing full product information.

#### Scenario: Navigate to product detail
- **WHEN** a user clicks on a product card on the home page
- **THEN** the system SHALL navigate to `/productos/{productId}`
- **AND** display the full product detail view with large image, name, description, price, stock indicator, ingredients list, and "Agregar al carrito" button

#### Scenario: Product detail loads data
- **WHEN** a user visits `/productos/{productId}`
- **THEN** the system SHALL fetch the product data from the API and display it using the ProductDetail component

#### Scenario: Product detail loading state
- **WHEN** the product data is being fetched
- **THEN** the system SHALL display a loading skeleton

#### Scenario: Product not found
- **WHEN** a user visits `/productos/{nonExistentId}`
- **THEN** the system SHALL display a "Producto no encontrado" message with a link back to the home page

#### Scenario: Product detail error state
- **WHEN** the product API returns an error
- **THEN** the system SHALL display an error message with a "Reintentar" button

### Requirement: Customer can add product to cart from detail page

The system SHALL allow customers to add the product to their cart directly from the detail page.

#### Scenario: Add available product to cart
- **WHEN** a user clicks "Agregar al carrito" on the product detail page
- **THEN** the system SHALL add the product to the cart via the cartStore
- **AND** show a visual confirmation (toast or badge update)

#### Scenario: Add unavailable product to cart is disabled
- **WHEN** a product has no stock or is not available
- **THEN** the "Agregar al carrito" button SHALL be disabled
- **AND** display "Producto no disponible"

### Requirement: Customer can navigate back from product detail

The system SHALL provide a way to return to the catalog from the product detail page.

#### Scenario: Back to catalog
- **WHEN** a user is on the product detail page
- **THEN** the system SHALL display a "Volver" (Back) button or breadcrumb
- **AND** clicking it SHALL navigate back to the home page catalog
