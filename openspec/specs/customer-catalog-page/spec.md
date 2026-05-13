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

