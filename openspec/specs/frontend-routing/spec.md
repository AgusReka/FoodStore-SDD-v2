# frontend-routing Specification

## Purpose
Client-side routing configuration for the FoodStore frontend — route definitions, layout wrapper, and lazy loading patterns.
## Requirements
### Requirement: Base routes defined

The frontend SHALL use React Router v6 with defined routes for all auth flows, including protected routes for authenticated pages.

**Reason:** The previous placeholder routes now point to fully implemented pages, and new auth routes have been added.

#### Scenario: Auth routes implemented
- **WHEN** the developer inspects the route configuration in `App.tsx`
- **THEN** the following routes SHALL be defined:
  - `/login` → `LoginPage` (implemented, not placeholder)
  - `/register` → `RegisterPage` (implemented, not placeholder)
  - `/forgot-password` → `ForgotPasswordPage`
  - `/reset-password` → `ResetPasswordPage`
  - `/verify-email` → `VerifyEmailPage`
  - `/profile` → `ProfilePage` (protected by `ProtectedRoute`)
- **AND** all auth routes (login, register, forgot-password, reset-password, verify-email) SHALL be publicly accessible

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

### Requirement: Protected route guard

The frontend SHALL provide a `ProtectedRoute` component that guards authenticated-only routes.

#### Scenario: ProtectedRoute redirects unauthenticated users
- **WHEN** an unauthenticated user navigates to a protected route (e.g., `/profile`)
- **THEN** the `ProtectedRoute` SHALL redirect to `/login?redirect=<original_path>`
- **AND** the original path SHALL be preserved in the `redirect` query parameter

#### Scenario: ProtectedRoute allows authenticated users
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the `ProtectedRoute` SHALL render the requested page component
- **AND** no redirect SHALL occur

#### Scenario: ProtectedRoute handles loading state
- **WHEN** the auth state is still loading (e.g., checking tokens)
- **THEN** the `ProtectedRoute` SHALL display a loading spinner
- **AND** SHALL NOT redirect until auth state is resolved

### Requirement: Login redirect preserves return URL

The login flow SHALL redirect users back to their originally requested page after successful authentication.

#### Scenario: Redirect after successful login
- **WHEN** a user logs in and a `redirect` query parameter was present
- **THEN** the user SHALL be navigated to the URL specified in the `redirect` parameter
- **WHEN** a user logs in without a `redirect` parameter
- **THEN** the user SHALL be navigated to `/`

#### Scenario: Register redirects to login
- **WHEN** a user successfully registers
- **THEN** the user SHALL be redirected to `/login?email=<registered_email>`

