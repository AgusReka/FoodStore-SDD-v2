# customer-header Specification

## Purpose
TBD - created by archiving change customer-catalog. Update Purpose after archive.
## Requirements
### Requirement: Customer sees navigation header on all public pages

The system SHALL display a sticky header/navbar at the top of all public-facing pages with the app logo, navigation, search, and cart access.

#### Scenario: Header is visible on home page
- **WHEN** a user visits the home page
- **THEN** the system SHALL display a sticky header at the top with the app name/logo, a search input, navigation links, and a cart icon

#### Scenario: Header is visible on product detail page
- **WHEN** a user visits the product detail page
- **THEN** the system SHALL display the same header with consistent styling

#### Scenario: Header is sticky
- **WHEN** a user scrolls down the page
- **THEN** the header SHALL remain fixed at the top of the viewport

### Requirement: Header shows cart item count

The system SHALL display the current number of items in the cart on the header cart icon.

#### Scenario: Empty cart shows no badge
- **WHEN** the cart is empty
- **THEN** the cart icon SHALL display without a badge count

#### Scenario: Cart with items shows count badge
- **WHEN** the cart has 3 items
- **THEN** the cart icon SHALL display a badge with the number "3"
- **AND** the badge SHALL update in real-time as items are added or removed

#### Scenario: Cart icon navigates to cart page
- **WHEN** a user clicks the cart icon in the header
- **THEN** the system SHALL navigate to the cart page

### Requirement: Header has a search input

The system SHALL include a search input in the header for quick product search.

#### Scenario: Search input is present in header
- **WHEN** a user views the header
- **THEN** a search input with placeholder "Buscar productos..." SHALL be displayed
- **AND** typing in the search input SHALL update the product catalog on the home page

#### Scenario: Search input on non-home pages
- **WHEN** a user is on a non-home page (e.g., product detail)
- **THEN** the search input in the header SHALL navigate to the home page with the search term applied

### Requirement: Header follows Mesa Design System styling

The system SHALL style the header according to the Mesa Design System (glassmorphism, warm orange brand, Inter Tight font).

#### Scenario: Header has glassmorphism effect
- **WHEN** a user views the header
- **THEN** the header SHALL have a backdrop blur effect, a semi-transparent background, and a subtle bottom border

#### Scenario: Header color scheme
- **WHEN** a user views the header
- **THEN** the header SHALL use the Mesa warm orange brand color for the logo/accent elements

