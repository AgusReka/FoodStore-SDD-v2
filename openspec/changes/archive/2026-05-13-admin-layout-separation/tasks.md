## 1. Frontend — Extract admin routes from Layout wrapper

- [x] 1.1 Move the `/admin/*` route block OUTSIDE the `<Route element={<Layout />}>` wrapper in `App.tsx`
- [x] 1.2 Move the `NotFound` catch-all route (`path="*"`) to the top level of `<Routes>`
- [x] 1.3 Keep `ProtectedRoute` wrapping on the admin route block
- [x] 1.4 Verify that `AdminPage` keeps its `<Outlet />` for child routes (no changes needed to AdminPage.tsx)

## 2. Frontend — Verify no regressions

- [x] 2.1 Verify customer Header appears on: `/`, `/productos/:id`, `/profile`, `/orders`, `/orders/:id`, `/cart`, `/checkout`
- [x] 2.2 Verify customer Header does NOT appear on: `/admin`, `/admin/categories`, `/admin/products`, `/admin/ingredients`, `/admin/stock-alerts`
- [x] 2.3 Verify admin sidebar renders correctly on all `/admin/*` routes
- [x] 2.4 Verify `NotFound` page renders correctly for invalid URLs (both customer and admin-like paths)
- [x] 2.5 Verify `ProtectedRoute` still redirects unauthenticated users from `/admin` to `/login`
