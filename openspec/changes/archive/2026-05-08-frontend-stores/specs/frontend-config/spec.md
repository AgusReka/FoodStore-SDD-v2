## ADDED Requirements

### Requirement: App constants defined

The frontend SHALL define application-wide constants in `shared/config/constants.ts`.

#### Scenario: Constants available
- **WHEN** a developer imports from `shared/config/constants`
- **THEN** the following constants SHALL be available:
  - `ACCESS_TOKEN_KEY` — localStorage key for access token
  - `REFRESH_TOKEN_KEY` — localStorage key for refresh token
  - `ACCESS_TOKEN_EXPIRY` — access token expiry in ms (30 minutes)
  - `STALE_TIME` — default TanStack Query stale time (5 minutes)
  - `PAGE_SIZE` — default pagination page size (20)
  - `MAX_PAGE_SIZE` — maximum allowed page size (100)

### Requirement: Route path constants defined

The frontend SHALL define all route path constants in `shared/config/routes.ts`.

#### Scenario: Route constants available
- **WHEN** a developer imports from `shared/config/routes`
- **THEN** the following route path constants SHALL be available:
  - `HOME`, `LOGIN`, `REGISTER`, `PROFILE`, `CART`, `CHECKOUT`, `ORDERS`, `ORDER_DETAIL`, `ADMIN_DASHBOARD`, `ADMIN_USERS`, `ADMIN_ORDERS`, `ADMIN_PRODUCTS`
  - AND helper functions for dynamic routes like `orderDetail(id)`, `adminUserDetail(id)`
