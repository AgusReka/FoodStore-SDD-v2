# customer-header delta spec

## MODIFIED Requirements

### Requirement: Header shows authenticated user navigation links

The system SHALL display navigation links for authenticated users on desktop and mobile.

#### Scenario: Desktop nav shows authenticated links
- **WHEN** a user is authenticated and views the navbar on desktop (768px+)
- **THEN** the navbar SHALL display "Menú" and "Mis Pedidos" text links
- **AND** the navbar SHALL display a person/user icon button that navigates to the profile page
- **AND** the navbar SHALL NOT display a "Mi Perfil" text link next to "Mis Pedidos"

#### Scenario: Mobile menu shows "Mi Perfil" label
- **WHEN** a user is authenticated and opens the mobile menu
- **THEN** the mobile menu SHALL display "Mi Perfil" and "Mis Pedidos" as text links
