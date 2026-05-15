## MODIFIED Requirements

### Requirement: Frontend login flow integration

The frontend login page SHALL integrate with the backend login API and handle authentication tokens.

#### Scenario: Logout clears TanStack Query cache
- **WHEN** the user clicks "Cerrar sesión"
- **THEN** `authStore.logout()` SHALL be called
- **AND** the TanStack Query client cache SHALL be cleared
- **AND** the user SHALL be redirected to `/login`
- **AND** when a new user logs in, the query cache SHALL fetch fresh data from the API (not serve stale cached data)

## ADDED Requirements

### Requirement: Frontend registration redirects to login

The frontend SHALL redirect to the login page after successful registration, without automatically logging in.

#### Scenario: Register redirects to login
- **WHEN** the user submits valid registration data
- **THEN** `authStore.register()` or the `useAuth` register mutation SHALL be called
- **AND** on success, the user SHALL be redirected to `/login?email=<email>`
- **AND** the system SHALL NOT call `login()` or store any authentication tokens

### Requirement: ProductDetailModal auth check

The ProductDetailModal SHALL redirect unauthenticated users to the login page when they attempt to add a product to cart.

#### Scenario: Modal redirects to login
- **WHEN** an unauthenticated user clicks "Agregar" in the ProductDetailModal
- **THEN** the modal SHALL close
- **AND** the user SHALL be redirected to `/login?redirect=/productos/<product-id>`
