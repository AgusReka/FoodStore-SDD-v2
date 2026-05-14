## MODIFIED Requirements

### Requirement: Customer sees navigation header on all public pages
The system SHALL display a sticky header/navbar at the top of all customer-facing pages with the app logo, navigation, search, and cart access.

**Old:** The system SHALL display a sticky header/navbar at the top of all public-facing pages with the app logo, navigation, search, and cart access.

**New:** The system SHALL display a sticky header/navbar at the top of all customer-facing pages with the app logo, navigation, search, and cart access. The customer header SHALL NOT appear on admin pages.

#### Scenario: Header is NOT visible on admin pages
- **WHEN** a user (including admin users) navigates to `/admin` or any `/admin/*` route
- **THEN** the system SHALL NOT display the customer header/navbar
- **AND** the page SHALL display the admin sidebar layout instead

#### Scenario: Header remains on customer pages
- **WHEN** a user visits non-admin pages (`/`, `/productos/:id`, `/profile`, `/orders`, `/cart`, etc.)
- **THEN** the system SHALL display the header with all existing functionality
- **AND** the header behavior SHALL be identical to before this change
