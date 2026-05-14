## MODIFIED Requirements

### Requirement: Customer can view product detail page

**Old:** The system SHALL provide a dedicated product detail page at `/productos/:id` showing full product information.

**New:** The system SHALL provide a product detail view as a modal on desktop (centered 680px, float-up animation, backdrop) and a bottom sheet on mobile (90vh, border-radius 28px 28px 0 0, slides up), showing full product information.

#### Scenario: Desktop shows centered modal
- **WHEN** a user clicks on a product card on desktop (768px+)
- **THEN** the system SHALL open a centered modal at 680px max-width with a float-up animation
- **AND** the modal SHALL display over a backdrop overlay
- **AND** the modal SHALL display: FoodArt CSS gradient placeholder, product name, description, price, stock indicator, chef name + avatar chip, Stars rating, tag badges, ingredient/allergen chips, and "Agregar al carrito" button

#### Scenario: Mobile shows bottom sheet
- **WHEN** a user clicks on a product card on mobile (< 768px)
- **THEN** the system SHALL slide up a bottom sheet at 90vh height
- **AND** the sheet SHALL have `border-radius: 28px 28px 0 0`
- **AND** the sheet SHALL display the same content as the desktop modal

#### Scenario: Modal closes on backdrop click
- **WHEN** a user clicks the backdrop outside the modal
- **THEN** the modal SHALL close
- **AND** the product detail SHALL be dismissed

#### Scenario: Product detail loads data
- **WHEN** a user opens a product detail view
- **THEN** the system SHALL fetch the product data from the API
- **AND** display it using the Mesa-styled ProductDetail component

#### Scenario: Product detail loading state
- **WHEN** the product data is being fetched
- **THEN** the system SHALL display a Mesa-styled loading skeleton

#### Scenario: Product not found
- **WHEN** a product ID does not exist
- **THEN** the system SHALL display a Mesa-styled "Producto no encontrado" message with a link back to the home page

#### Scenario: Product detail error state
- **WHEN** the product API returns an error
- **THEN** the system SHALL display a Mesa-styled error message with a "Reintentar" button

### Requirement: Customer can add product to cart from detail view

**Old:** The system SHALL allow customers to add the product to their cart directly from the detail page.

**New:** (Unchanged behavior, Mesa-styled components)

#### Scenario: Add available product to cart
- **WHEN** a user clicks "Agregar al carrito" on the product detail view
- **THEN** the system SHALL add the product to the cart via the cartStore
- **AND** show a visual confirmation (Mesa-styled toast or badge update)

#### Scenario: Add unavailable product to cart is disabled
- **WHEN** a product has no stock or is not available
- **THEN** the "Agregar al carrito" button SHALL be disabled
- **AND** display "Producto no disponible"

### Requirement: Customer can navigate back from product detail

**Old:** The system SHALL provide a way to return to the catalog from the product detail page.

**New:** (Unchanged behavior — closing the modal or dismissing the bottom sheet returns to the catalog)

#### Scenario: Close modal returns to catalog
- **WHEN** a user closes the product detail modal or bottom sheet
- **THEN** the system SHALL return to the catalog view below


