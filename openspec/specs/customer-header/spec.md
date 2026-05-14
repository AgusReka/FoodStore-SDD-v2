# customer-header Specification

## Purpose
TBD - created by archiving change customer-catalog. Update Purpose after archive.
## Requirements
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

### Requirement: Header follows Mesa Design System styling

The system SHALL style the header according to the Mesa Design System (glassmorphism, warm orange brand, Inter Tight font).

#### Scenario: Header has glassmorphism effect
- **WHEN** a user views the header
- **THEN** the header SHALL have a backdrop blur effect, a semi-transparent background, and a subtle bottom border

#### Scenario: Header color scheme
- **WHEN** a user views the header
- **THEN** the header SHALL use the Mesa warm orange brand color for the logo/accent elements

### Requirement: Navbar has glassmorphism effect

The system SHALL apply a glassmorphism effect to the navbar using backdrop-filter blur and a semi-transparent background with rounded pill shape.

#### Scenario: Glassmorphism effect applied
- **WHEN** a user views the navbar
- **THEN** the navbar SHALL have `backdrop-filter: blur(16px)` or equivalent
- **AND** the background SHALL be semi-transparent (RGBA or HSL with opacity)
- **AND** the navbar SHALL have a rounded pill shape (`border-radius: 9999px` or equivalent)

### Requirement: Navbar scroll-reactive shadow

The system SHALL intensify the navbar shadow when the user scrolls past 12px.

#### Scenario: Shadow intensifies on scroll
- **WHEN** `window.scrollY > 12`
- **THEN** the navbar SHALL apply a larger box-shadow (e.g., `shadow-lg` or `0 4px 24px rgba(0,0,0,0.12)`)
- **WHEN** `window.scrollY <= 12`
- **THEN** the navbar SHALL have a minimal shadow (e.g., `shadow-sm` or `0 1px 4px rgba(0,0,0,0.04)`)

### Requirement: Navbar shows nav links on desktop, compact on mobile

The system SHALL display full navigation links on desktop and a compact pill with icons only on mobile.

#### Scenario: Desktop shows full navigation links
- **WHEN** a user views the navbar on a viewport width of 768px or greater
- **THEN** the navbar SHALL display text-based navigation links (Inicio, Productos, etc.)
- **AND** the full app name/logo SHALL be visible

#### Scenario: Mobile shows compact pill with icons
- **WHEN** a user views the navbar on a viewport width less than 768px
- **THEN** the navbar SHALL display only icon-based navigation items
- **AND** the app logo SHALL be abbreviated or shown as an icon

