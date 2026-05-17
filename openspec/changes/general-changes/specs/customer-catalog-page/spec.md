# customer-catalog-page delta spec

## MODIFIED Requirements

### Requirement: Customer can browse all products on the home page

The system SHALL display a catalog of all available products on the home page with a responsive grid layout.

#### Scenario: Home page loads with product grid
- **WHEN** a user visits the root URL `/`
- **THEN** the system SHALL display a grid of product cards showing: product image, name, price, stock status, and delivery time estimate
- **AND** the grid SHALL be responsive: 2 columns on mobile, 3 on tablet, 4 on desktop
- **AND** the product card SHALL NOT display the ingredient list
- **AND** the product card SHALL display the "add to cart" button (or "+" icon) inline with the price text, NOT overlapping the image

#### Scenario: Home page shows loading state
- **WHEN** a user visits the root URL while products are being fetched
- **THEN** the system SHALL display skeleton loading cards in the grid layout

#### Scenario: Home page shows empty state
- **WHEN** no products are available
- **THEN** the system SHALL display a friendly empty state message ("No hay productos disponibles")

#### Scenario: Home page handles API error
- **WHEN** the products API returns an error
- **THEN** the system SHALL display an error message with a "Reintentar" (Retry) button

### Requirement: Product card text overflow protection

The system SHALL limit text content within product card boundaries to prevent layout breakage.

#### Scenario: Product name truncates to one line
- **WHEN** a product name is longer than the card width allows
- **THEN** the name SHALL be truncated to a single line with ellipsis (`line-clamp-1`)

#### Scenario: Product description truncates to two lines
- **WHEN** a product description is longer than two lines
- **THEN** the description SHALL be truncated to two lines with ellipsis (`line-clamp-2`)

## REMOVED Requirements

### Requirement: Product card shows ingredient list

**Reason**: Ingredient list removed from compact product card to reduce visual noise and prevent layout overflow. Full ingredient detail is available in the ProductDetailModal.

**Migration**: No migration needed. Ingredient information remains accessible via the product detail modal.
