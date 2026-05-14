## MODIFIED Requirements

### Requirement: Customer sees navigation header on all public pages

**Old:** The system SHALL display a sticky header/navbar at the top of all customer-facing pages with the app logo, navigation, search, and cart access.

**New:** The system SHALL display a floating glass pill Navbar centered at the top of all customer-facing pages with the app logo, navigation, search, and cart access. The navbar SHALL be fixed-position, centered horizontally, with a scroll-reactive shadow that intensifies when scrolled past 12px.

#### Scenario: Navbar is floating glass pill
- **WHEN** a user views any customer-facing page at the top
- **THEN** the navbar SHALL be a fixed-position pill centered horizontally
- **AND** the navbar SHALL have a glassmorphism effect (backdrop-filter blur, semi-transparent background, rounded pill shape)
- **AND** the navbar SHALL NOT appear on admin pages

#### Scenario: Navbar scroll-reactive shadow
- **WHEN** a user scrolls past 12px from the top of the page
- **THEN** the navbar shadow SHALL intensify (larger blur, more opacity)
- **WHEN** a user is at the top of the page (scroll < 12px)
- **THEN** the navbar SHALL have minimal or no shadow

#### Scenario: Navbar shows nav links on desktop, compact on mobile
- **WHEN** a user views the navbar on desktop (768px+)
- **THEN** the navbar SHALL display full navigation links
- **WHEN** a user views the navbar on mobile (<768px)
- **THEN** the navbar SHALL display a compact pill with icons only

#### Scenario: Header cart icon behaves unchanged
- **WHEN** a user views the navbar
- **THEN** the cart icon SHALL display the current item count badge
- **AND** clicking the cart icon SHALL navigate to the cart page

### Requirement: Header has a search input

**Old:** The system SHALL include a search input in the header for quick product search.

**New:** The system SHALL include a search input embedded in the Navbar on desktop (or a SearchPalette trigger icon on mobile) for quick product search.

#### Scenario: Search input embedded in navbar on desktop
- **WHEN** a user views the navbar on desktop
- **THEN** a search input with placeholder "Buscar productos..." SHALL be embedded in the navbar
- **AND** typing in the search input SHALL filter the product catalog

#### Scenario: Search icon on mobile opens SearchPalette
- **WHEN** a user views the navbar on mobile
- **THEN** a search icon SHALL be displayed in the compact navbar
- **AND** clicking it SHALL open a SearchPalette overlay

#### Scenario: Search input on non-home pages
- **WHEN** a user is on a non-home page (e.g., product detail)
- **THEN** the search input in the navbar SHALL navigate to the home page with the search term applied


