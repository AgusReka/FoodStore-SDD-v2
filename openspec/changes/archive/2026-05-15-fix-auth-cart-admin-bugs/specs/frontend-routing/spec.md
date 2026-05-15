## MODIFIED Requirements

### Requirement: Protected route guard

The frontend SHALL provide a `ProtectedRoute` component that guards authenticated-only routes.

#### Scenario: Admin route requires admin role
- **WHEN** a user with role `cliente` navigates to `/admin/*`
- **THEN** the `ProtectedRoute` SHALL redirect to `/` (home)
- **AND** the user SHALL NOT see the admin panel
- **WHEN** a user with role `admin` navigates to `/admin/*`
- **THEN** the `ProtectedRoute` SHALL render the requested admin page
- **AND** no redirect SHALL occur
