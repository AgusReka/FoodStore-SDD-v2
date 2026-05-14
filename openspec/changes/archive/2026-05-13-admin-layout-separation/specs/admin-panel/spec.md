## ADDED Requirements

### Requirement: Admin layout renders independently
The admin panel SHALL render as a standalone layout with its own sidebar navigation, independent of the customer layout.

#### Scenario: Admin page has independent DOM tree
- **WHEN** an admin navigates to `/admin`
- **THEN** the page SHALL render `AdminPage` as the root layout element
- **AND** the page SHALL NOT be wrapped by the customer `Layout` component
- **AND** the admin sidebar SHALL be the only navigation element

#### Scenario: Admin sidebar "Volver a la tienda" navigates correctly
- **WHEN** an admin clicks "← Volver a la tienda" in the admin sidebar
- **THEN** the system SHALL navigate to `/`
- **AND** the customer `<Header />` SHALL appear on the destination page
