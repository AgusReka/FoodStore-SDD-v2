# customer-home-landing Specification

## Purpose
TBD - created by archiving change client-ui-mesa-redesign. Update Purpose after archive.
## Requirements
### Requirement: Landing page has Hero section with 2-column layout

The system SHALL display a hero section on the landing page with a 2-column layout featuring copy on the left and a visual card on the right.

#### Scenario: Hero section renders with gradient headline
- **WHEN** a user visits the root URL `/`
- **THEN** the hero section SHALL display a 2-column grid layout
- **AND** the left column SHALL contain a display headline with gradient text effect
- **AND** the left column SHALL contain CTA buttons "Pedir ahora" and "Cómo funciona"
- **AND** the right column SHALL contain a visual food art card or illustration

#### Scenario: Hero section shows trust stats
- **WHEN** a user views the hero section
- **THEN** the section SHALL display trust stats below the headline: delivery time (e.g., "30 min"), rating (e.g., "4.8 ★"), and chef count

#### Scenario: CTA buttons have distinct styling
- **WHEN** a user views the hero section
- **THEN** "Pedir ahora" SHALL use the `.btn-primary` class (solid orange)
- **AND** "Cómo funciona" SHALL use the `.btn-ghost` class (outlined)

### Requirement: Landing page has TrustStrip with stat cards

The system SHALL display a TrustStrip section with 4 stat cards showing key metrics.

#### Scenario: TrustStrip shows 4 stat cards
- **WHEN** a user scrolls past the hero section on `/`
- **THEN** the system SHALL display a horizontal strip of 4 stat cards
- **AND** each card SHALL display an icon, a metric value, and a label

#### Scenario: TrustStrip is responsive
- **WHEN** a user views the TrustStrip on mobile
- **THEN** the cards SHALL stack in a 2x2 grid
- **WHEN** a user views the TrustStrip on desktop
- **THEN** the cards SHALL display in a single row

### Requirement: Landing page has CategoryRail with icon pills

The system SHALL display a horizontal scrollable CategoryRail of icon pills below the TrustStrip.

#### Scenario: CategoryRail displays category pills
- **WHEN** a user views the landing page
- **THEN** the system SHALL display a horizontal scrollable row of category pills
- **AND** each pill SHALL contain an icon and a category name
- **AND** the first pill ("Todas") SHALL be selected by default

#### Scenario: Category pill is clickable
- **WHEN** a user clicks a category pill
- **THEN** the product grid SHALL filter to show only products in that category

### Requirement: Landing page has FiltersRow with toggle chips

The system SHALL display a row of filter toggle chips below the CategoryRail.

#### Scenario: FiltersRow displays filter toggles
- **WHEN** a user views the landing page
- **THEN** the system SHALL display a row of filter chips: "Bajo 20min", "Vegano", "Trending", "Nuevos"
- **AND** each chip SHALL use the `.chip` class with toggle behavior

#### Scenario: Filter chip toggle is applied
- **WHEN** a user clicks a filter chip (e.g., "Vegano")
- **THEN** the chip SHALL become visually active (filled state)
- **AND** the product grid SHALL be filtered accordingly

### Requirement: Landing page has ChefsRail with profile cards

The system SHALL display a horizontal scrollable ChefsRail section showing chef profile cards.

#### Scenario: ChefsRail displays chef cards
- **WHEN** a user scrolls to the ChefsRail section on `/`
- **THEN** the system SHALL display a horizontal scrollable row of chef profile cards
- **AND** each card SHALL display an avatar, chef name, specialty, and rating

#### Scenario: Chef card navigates to chef detail
- **WHEN** a user clicks a chef card
- **THEN** the system SHALL navigate to the chef's product catalog page

### Requirement: Landing page has CTA Banner for seasonal promotions

The system SHALL display a full-width dark CTA Banner section for seasonal promotions.

#### Scenario: CTA Banner renders with dark background
- **WHEN** a user scrolls to the CTA Banner section
- **THEN** the system SHALL display a full-width section with a dark/ambient background
- **AND** the section SHALL contain a promotional headline, description, and a CTA button

### Requirement: Landing page has ProductGrid with stagger entry animation

The system SHALL display the product grid with a stagger entry animation when products appear on screen.

#### Scenario: ProductGrid animates on scroll
- **WHEN** a user scrolls to the ProductGrid section
- **THEN** the product cards SHALL enter with a stagger animation using the `.stagger` class
- **AND** each card SHALL fade and float up sequentially with a delay between cards

#### Scenario: ProductGrid is responsive
- **WHEN** a user views the ProductGrid on mobile
- **THEN** the grid SHALL display 1 column
- **WHEN** a user views the ProductGrid on desktop
- **THEN** the grid SHALL display 3-4 columns with `minmax(248px, 1fr)`

### Requirement: All landing page sections are responsive

All landing page sections SHALL adapt layout between mobile (single column) and desktop (full layout).

#### Scenario: Mobile layout is single column
- **WHEN** a user views the landing page on a mobile device (375px - 767px)
- **THEN** all sections SHALL display in a single column layout
- **AND** content SHALL be vertically stacked with proper spacing

#### Scenario: Desktop layout is full multi-column
- **WHEN** a user views the landing page on a desktop device (1024px+)
- **THEN** sections SHALL use multi-column layouts as specified
- **AND** content SHALL use the `.container` class for max-width centering

### Requirement: Home page SHALL display Hero section

**Old:** (none — new requirement)

**New:** The system SHALL display a Hero section on the home page with gradient headline text, CTA buttons, trust stats, and floating product/delivery chips.

#### Scenario: Hero displays brand messaging
- **WHEN** the user visits the home page
- **THEN** the Hero section SHALL display gradient headline text, CTA buttons, and trust stats

### Requirement: Home page SHALL display ChefsRail

**Old:** (none — new requirement)

**New:** The system SHALL display a ChefsRail section on the home page with chef profile cards in a horizontal scrollable row on mobile or grid on desktop.

#### Scenario: Chefs appear in a horizontal rail
- **WHEN** the home page loads
- **THEN** a ChefsRail SHALL display chef profile cards in a horizontal scrollable row

### Requirement: Home page SHALL include CTA Banner

**Old:** (none — new requirement)

**New:** The system SHALL include a full-width CTA Banner section below the product grid with headline, description, and action button.

#### Scenario: CTA Banner appears below content
- **WHEN** the user scrolls past the product grid
- **THEN** a full-width CTA Banner SHALL display with headline and action button

