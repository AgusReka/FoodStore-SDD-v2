## ADDED Requirements

### Requirement: React Router v6 configured with base routes
The frontend SHALL use React Router v6 for client-side routing.

#### Scenario: Router provider wraps the app
- **WHEN** the developer inspects `main.tsx` or `App.tsx`
- **THEN** the app SHALL use `BrowserRouter` or `HashRouter` from `react-router-dom`
- **AND** the router SHALL be configured to wrap all route definitions

#### Scenario: Base routes defined
- **WHEN** the developer inspects the route configuration
- **THEN** the following routes SHALL be defined as placeholders:
  - `/` (home route) → placeholder component
  - `/login` → placeholder login page
  - `/register` → placeholder register page
  - `*` (404) → NotFound component
- **AND** routes SHALL be ready to be protected by role in `rbac-guard` change

### Requirement: Layout component for shared UI
The app SHALL have a root Layout component for shared UI elements.

#### Scenario: Layout with Outlet
- **WHEN** the developer inspects the routing structure
- **THEN** there SHALL be a `Layout` component using `<Outlet />` from react-router-dom
- **AND** the Layout SHALL wrap all child routes (prepared for navbar/sidebar)

### Requirement: Lazy loading prepared for routes
The routing setup SHALL be prepared for code splitting with React.lazy.

#### Scenario: Routes ready for lazy loading
- **WHEN** the developer wants to add a new route
- **THEN** the pattern SHALL be documented: use `React.lazy(() => import('./Page'))` with `<Suspense>`
- **AND** an example or comment SHALL demonstrate this pattern in the route definition file
