## Why

The admin panel currently renders inside the same root `<Layout />` component as customer-facing pages, causing the customer navbar (`Header`) to appear above the admin sidebar on all `/admin/*` routes. This creates visual confusion — admins see two navigation systems (client navbar + admin sidebar) simultaneously, and the client navbar's links (Menú, Mi Perfil, Mis Pedidos, Cart) are irrelevant in the admin context. The layout structure needs to be separated so admin pages render independently without the customer navigation.

## What Changes

- **Extract admin routes from the customer layout**: Move `/admin/*` routes out of the `<Layout>` wrapper so they no longer include the customer `<Header />`
- **AdminPage becomes a standalone layout**: The admin sidebar layout already exists (`AdminPage.tsx`) — it just needs to be its own top-level route without the customer header
- **Customer layout unaffected**: All non-admin routes (`/`, `/productos/*`, `/login`, `/profile`, `/orders`, etc.) continue to show the customer navbar as before
- **No visual changes to customer pages**: Header behavior on customer routes is completely unchanged

## Capabilities

### New Capabilities
- `admin-layout`: Standalone admin layout with sidebar navigation, independent of the customer header — ensures admin pages render without client navigation chrome

### Modified Capabilities
- `frontend-routing`: Route structure changes — admin routes are no longer nested under the shared Layout; AdminPage becomes an independent top-level route
- `customer-header`: Clarify that the header appears on customer-facing routes only, not on admin pages
- `admin-panel`: AdminPage renders as a standalone layout with its own sidebar + `<Outlet />` — no dependency on the root Layout component

## Impact

- **Frontend only**: No backend, database, or API changes
- `frontend/src/app/App.tsx`: Route restructure — admin routes move outside the Layout wrapper
- `frontend/src/app/Layout.tsx`: Unchanged — still wraps all customer routes with `<Header />`
- `frontend/src/pages/AdminPage.tsx`: No changes needed — already renders its own sidebar + `<Outlet />`
- **No breaking changes**: All existing URLs remain the same; behavior on customer pages is identical
