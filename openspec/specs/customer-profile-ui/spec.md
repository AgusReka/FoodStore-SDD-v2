# customer-profile-ui Specification

## Purpose
TBD - created by archiving change client-ui-mesa-redesign. Update Purpose after archive.
## Requirements
### Requirement: Profile page has Avatar card

The system SHALL display an avatar card at the top of the profile page with user identity and stats.

#### Scenario: Avatar card shows user info
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the system SHALL display an avatar card with: initials circle, full name, email, member since date, and stats (order count, favorites count, rating)

#### Scenario: Avatar card stats are visible
- **WHEN** a user views the avatar card
- **THEN** the card SHALL display numeric stats: total orders, total favorites, and average rating

### Requirement: Profile page uses 2-column layout with sidebar on desktop

The system SHALL display the profile page with a 2-column layout: sidebar navigation (240px) on the left and content area on the right on desktop.

#### Scenario: Desktop shows sidebar nav
- **WHEN** a user views the profile page on desktop (1024px+)
- **THEN** the page SHALL display a 240px sidebar on the left with navigation links
- **AND** the content area SHALL fill the remaining space on the right

#### Scenario: Mobile shows horizontal scrollable tabs
- **WHEN** a user views the profile page on mobile (< 1024px)
- **THEN** the page SHALL display horizontal scrollable tabs instead of a sidebar

### Requirement: Profile page has tab navigation

The profile page SHALL have three tabs: "Mis pedidos", "Direcciones", and "Ajustes".

#### Scenario: Profile tabs render
- **WHEN** a user views the profile page
- **THEN** the sidebar (desktop) or tab bar (mobile) SHALL display "Mis pedidos", "Direcciones", and "Ajustes" tabs
- **AND** the first tab SHALL be selected by default

#### Scenario: Tab switching changes content
- **WHEN** a user clicks a different tab
- **THEN** the content area SHALL display the corresponding panel
- **AND** the selected tab SHALL be visually highlighted

### Requirement: Profile page has Order history tab

The "Mis pedidos" tab SHALL display order history as styled order cards.

#### Scenario: Order history tab shows order cards
- **WHEN** a user views the "Mis pedidos" tab
- **THEN** the system SHALL display order cards with: truncated order ID, status badge, item count, date, and total
- **AND** each card SHALL navigate to `/orders/{order_id}` on click

### Requirement: Profile page has Addresses tab

The "Direcciones" tab SHALL display saved addresses as styled address cards.

#### Scenario: Addresses tab shows address cards
- **WHEN** a user views the "Direcciones" tab
- **THEN** the system SHALL display saved addresses as styled cards with street, city, and postal code
- **AND** the primary address SHALL display a "Primaria" badge

#### Scenario: Addresses tab has add button
- **WHEN** a user views the "Direcciones" tab
- **THEN** an "Agregar dirección" button SHALL be displayed
- **AND** clicking it SHALL open an inline form or modal

### Requirement: Profile page has Settings tab

The "Ajustes" tab SHALL display preference toggles and inline edit form.

#### Scenario: Settings tab shows preference toggles
- **WHEN** a user views the "Ajustes" tab
- **THEN** the system SHALL display toggle switches for: notifications, promotional emails, and privacy settings

#### Scenario: Inline edit for personal info
- **WHEN** a user clicks a pencil/edit icon next to their name or email
- **THEN** the field SHALL expand into an inline editable form
- **AND** a save/cancel option SHALL be available

#### Scenario: Settings tab shows logout button
- **WHEN** a user views the "Ajustes" tab
- **THEN** a red logout button SHALL be displayed at the bottom of the page
- **AND** clicking it SHALL log the user out and redirect to the home page

### Requirement: Profile page SHALL display avatar card

**Old:** (none — new requirement)

**New:** The system SHALL display an avatar card on the profile page with user initials, full name, email, and order statistics. The page SHALL use a responsive layout: desktop 2-column with sidebar, mobile with horizontal tabs.

#### Scenario: User profile shows avatar card
- **WHEN** the user visits their profile
- **THEN** an avatar card SHALL display with initials, name, email, and order stats

#### Scenario: Desktop shows sidebar layout
- **WHEN** viewed on desktop (768px+)
- **THEN** profile SHALL display as 2-column layout with sidebar navigation

#### Scenario: Mobile shows horizontal tabs
- **WHEN** viewed on mobile (< 768px)
- **THEN** profile SHALL display horizontal tab navigation instead of sidebar

### Requirement: Profile SHALL include address edit form

**Old:** (none — new requirement)

**New:** The system SHALL provide an inline address edit form on the profile page with required field indicators (*) and a "Campos obligatorios" note.

#### Scenario: User edits address inline
- **WHEN** the user clicks edit on an address
- **THEN** an inline form SHALL appear with required field indicators and "Campos obligatorios" note

