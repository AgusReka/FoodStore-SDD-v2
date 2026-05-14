# customer-product-detail Specification

## Purpose
TBD - created by archiving change customer-catalog. Update Purpose after archive.
## Requirements
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

### Requirement: Product detail has FoodArt CSS gradient placeholder

The product detail view SHALL display a CSS gradient placeholder using the `.food-art` class when no product image is available.

#### Scenario: FoodArt placeholder shown
- **WHEN** a product has no image or while the image loads
- **THEN** the `.food-art` class SHALL render a warm gradient placeholder

### Requirement: Product detail shows chef name and avatar

The product detail view SHALL display the chef's name and avatar chip.

#### Scenario: Chef chip displayed
- **WHEN** a user views the product detail
- **THEN** the chef's name SHALL be displayed with an avatar chip
- **AND** the chip SHALL be styled with Mesa typography

### Requirement: Product detail shows Stars rating

The product detail view SHALL display a star rating component.

#### Scenario: Stars rating displayed
- **WHEN** a user views the product detail
- **THEN** a star rating SHALL be displayed showing the product's average rating
- **AND** the rating SHALL use Mesa brand color for filled stars

### Requirement: Product detail shows tag badges

The product detail view SHALL display tag badges (Vegano, Premium, Temporada).

#### Scenario: Tag badges displayed
- **WHEN** a product has tags (e.g., Vegano, Premium)
- **THEN** the product detail SHALL display colored tag badges
- **AND** each tag SHALL have distinct styling

### Requirement: Product detail shows ingredient/allergen chips

The product detail view SHALL display ingredient and allergen information as chips.

#### Scenario: Ingredient chips displayed
- **WHEN** a user views the product detail
- **THEN** ingredients SHALL be displayed as chips below the description

### Requirement: Product detail has Counter quantity selector

The product detail view SHALL include a counter/quantity selector before the "Agregar al carrito" button.

#### Scenario: Quantity selector displayed
- **WHEN** a user views the product detail
- **THEN** a counter with "−" and "+" buttons and the current quantity SHALL be displayed
- **AND** the minimum quantity SHALL be 1
- **AND** "Agregar al carrito" SHALL add the selected quantity to the cart

