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
The app SHALL have a root Layout component for the customer-facing section.

**Old:** The Layout SHALL wrap all child routes (prepared for navbar/sidebar).

**New:** The Layout SHALL wrap customer-facing routes only. Admin routes SHALL use a separate standalone layout (`AdminPage`) that is NOT nested inside the root Layout.

#### Scenario: Layout wraps only customer routes
- **WHEN** the developer inspects the route configuration in `App.tsx`
- **THEN** the `<Route element={<Layout />}>` wrapper SHALL only contain customer-facing routes (public pages + protected customer pages)
- **AND** `/admin/*` routes SHALL be defined OUTSIDE the Layout wrapper

#### Scenario: AdminPage renders as standalone layout
- **WHEN** the developer inspects the route configuration
- **THEN** `/admin/*` routes SHALL be defined with `AdminPage` as a top-level route element (not nested inside Layout)
- **AND** `AdminPage` SHALL be wrapped by `ProtectedRoute`
- **AND** `AdminPage` SHALL remain at the same path (`/admin`) as before

#### Scenario: 404 route at top level
- **WHEN** the developer inspects the route configuration
- **THEN** the `NotFound` catch-all route (`path="*"`) SHALL be defined at the top level of `<Routes>`, outside both the Layout wrapper and the admin branch

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

### Requirement: Admin orders routes defined

The frontend SHALL define routes for the admin orders management pages under the admin layout.

#### Scenario: Admin orders list route
- **WHEN** the developer inspects the route configuration
- **THEN** the route `/admin/orders` SHALL be defined inside the admin `<Route>` block
- **AND** it SHALL render the admin orders list page component
- **AND** it SHALL be a child of the `AdminPage` layout (renders inside `<Outlet />`)

#### Scenario: Admin order detail route
- **WHEN** the developer inspects the route configuration
- **THEN** the route `/admin/orders/:id` SHALL be defined inside the admin `<Route>` block
- **AND** it SHALL render the admin order detail page component
- **AND** the `:id` parameter SHALL be the order UUID

#### Scenario: Route order matches sidebar
- **WHEN** the developer inspects the route configuration
- **THEN** the admin orders route SHALL be placed after products and before stock-alerts, matching the sidebar navigation order

