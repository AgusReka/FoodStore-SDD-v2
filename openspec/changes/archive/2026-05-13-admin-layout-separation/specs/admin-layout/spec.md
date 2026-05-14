## ADDED Requirements

### Requirement: Admin layout renders independently from customer layout

The system SHALL provide a standalone admin layout that renders the admin sidebar without the customer navigation header.

#### Scenario: Admin page shows sidebar but no customer header
- **WHEN** an admin navigates to `/admin`
- **THEN** the page SHALL display the admin sidebar navigation
- **AND** the page SHALL NOT display the customer `<Header />` component (logo, Menú, Mi Perfil, Mis Pedidos, Cart)

#### Scenario: Customer header unaffected on non-admin routes
- **WHEN** any user navigates to `/` or any non-admin route
- **THEN** the customer `<Header />` SHALL display exactly as before

### Requirement: Admin sidebar remains unchanged

The admin sidebar SHALL continue to function as before — same navigation items, same badge on stock alerts, same "Volver a la tienda" link.

#### Scenario: Admin sidebar navigation items
- **WHEN** an admin views the sidebar
- **THEN** the sidebar SHALL show: Dashboard, Categorías, Ingredientes, Productos, Alertas de Stock
- **AND** SHALL show the stock alert badge when alerts exist
- **AND** SHALL show "← Volver a la tienda" link at the bottom

### Requirement: Admin routes remain protected

All `/admin/*` routes SHALL remain behind the `ProtectedRoute` guard with authentication check.

#### Scenario: Unauthenticated user redirected from /admin
- **WHEN** an unauthenticated user navigates to `/admin`
- **THEN** the system SHALL redirect to `/login?redirect=/admin`
