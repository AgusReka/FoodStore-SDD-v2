## MODIFIED Requirements

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
