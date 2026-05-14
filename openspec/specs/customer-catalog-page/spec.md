# customer-catalog-page Specification

## Purpose
TBD - created by archiving change customer-catalog. Update Purpose after archive.
## Requirements
### Requirement: Customer can browse all products on the home page

The system SHALL display a catalog of all available products on the home page with a responsive grid layout.

#### Scenario: Home page loads with product grid
- **WHEN** a user visits the root URL `/`
- **THEN** the system SHALL display a grid of product cards showing product image, name, price, stock status, and ingredient list
- **AND** the grid SHALL be responsive: 2 columns on mobile, 3 on tablet, 4 on desktop

#### Scenario: Home page shows loading state
- **WHEN** a user visits the root URL while products are being fetched
- **THEN** the system SHALL display skeleton loading cards in the grid layout

#### Scenario: Home page shows empty state
- **WHEN** no products are available
- **THEN** the system SHALL display a friendly empty state message ("No hay productos disponibles")

#### Scenario: Home page handles API error
- **WHEN** the products API returns an error
- **THEN** the system SHALL display an error message with a "Reintentar" (Retry) button

### Requirement: Customer can search products by name

The system SHALL allow customers to search products by name using a search bar on the home page.

#### Scenario: Search by product name
- **WHEN** a user types "pizza" in the search bar
- **THEN** the system SHALL display only products whose name contains "pizza" (case-insensitive)
- **AND** search SHALL be debounced at 300ms before triggering the API call

#### Scenario: Clear search
- **WHEN** a user clears the search bar text
- **THEN** the system SHALL reset the product grid to show all available products

#### Scenario: No search results
- **WHEN** a user searches for a term that matches no products
- **THEN** the system SHALL display "No se encontraron productos para \"{searchTerm}\""

### Requirement: Customer can filter products by category

The system SHALL allow customers to filter the product grid by category using a category rail.

#### Scenario: Category filter rail is displayed
- **WHEN** a user visits the home page
- **THEN** the system SHALL display a horizontal scrollable list of category pills above the product grid
- **AND** the first pill SHALL be "Todas" (All) selected by default

#### Scenario: Filter by category
- **WHEN** a user clicks on a category pill (e.g., "Pizzas")
- **THEN** the system SHALL display only products belonging to that category
- **AND** the selected pill SHALL be visually highlighted

#### Scenario: Reset category filter
- **WHEN** a user clicks "Todas" (All) pill after filtering by a category
- **THEN** the system SHALL display all available products again

### Requirement: Customer can paginate through products

The system SHALL support pagination of the product grid with page-based navigation.

#### Scenario: Navigate to next page
- **WHEN** there are more products than the page size (default 12)
- **THEN** the system SHALL display pagination controls at the bottom of the grid
- **AND** clicking the next page button SHALL load the next set of products

#### Scenario: Pagination preserves filters
- **WHEN** a user changes page while a category filter or search term is active
- **THEN** the pagination SHALL respect the active filters

### Requirement: Product grid uses stagger entry animation

The product grid SHALL use the `.stagger` CSS class for stagger entry animation when products appear.

#### Scenario: Stagger animation on product cards
- **WHEN** a user scrolls to the product grid section
- **THEN** each product card SHALL animate in sequentially using the `.stagger` class
- **AND** cards SHALL fade and float up with a staggered delay between each card

### Requirement: Product cards use hover lift animation

Product cards SHALL use a hover lift animation (translateY(-4px) and shadow-lg) on mouse hover.

#### Scenario: Hover lift on product card
- **WHEN** a user hovers over a product card
- **THEN** the card SHALL translate up by 4px (`transform: translateY(-4px)`)
- **AND** the card shadow SHALL increase to `shadow-lg` or equivalent
- **AND** the transition SHALL be smooth (0.2s ease or similar)

### Requirement: Filter toggle chips row below CategoryRail

The system SHALL display a row of filter toggle chips below the CategoryRail.

#### Scenario: Filter chips below category rail
- **WHEN** a user views the catalog page
- **THEN** a row of toggle chips SHALL be displayed below the CategoryRail
- **AND** the chips SHALL include: "Bajo 20min", "Vegano", "Trending", "Nuevos"
- **AND** each chip SHALL use the `.chip` class with toggle behavior

#### Scenario: Filter chip toggle updates grid
- **WHEN** a user clicks a filter chip
- **THEN** the chip SHALL toggle to active state
- **AND** the product grid SHALL update to show only matching products

### Requirement: Grid responsive with minmax

The product grid SHALL be responsive: mobile 1-2 columns, desktop 3-4 columns using `minmax(248px, 1fr)`.

#### Scenario: Mobile grid 1-2 columns
- **WHEN** a user views the product grid on mobile (< 768px)
- **THEN** the grid SHALL display 1 column on small screens and 2 columns on medium screens

#### Scenario: Desktop grid 3-4 columns
- **WHEN** a user views the product grid on desktop (1024px+)
- **THEN** the grid SHALL display 3-4 columns using `grid-template-columns: repeat(auto-fill, minmax(248px, 1fr))`

### Requirement: Catalog page SHALL display products with stagger animation

**Old:** (none — new requirement)

**New:** The system SHALL display the product catalog with stagger animation where each card fades in sequentially. Filter chips SHALL toggle product visibility by category (Bajo 20min, Vegano, Trending, Nuevos).

#### Scenario: Products appear with stagger animation
- **WHEN** the catalog page loads
- **THEN** each product card SHALL fade in sequentially with a stagger delay

#### Scenario: Filter chips toggle product visibility
- **WHEN** the user clicks a filter chip
- **THEN** the product grid SHALL update to show only matching products

