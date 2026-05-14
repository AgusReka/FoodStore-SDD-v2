## Context

The current routing structure in `App.tsx` wraps ALL routes — including `/admin/*` — inside a shared `<Route element={<Layout />}>`. The `Layout` component renders `<Header />` (the customer navbar with logo, Menú, Mi Perfil, Mis Pedidos, and Cart icon). Meanwhile, `AdminPage.tsx` renders its own full-width sidebar navigation.

This produces a double-navigation layout on admin pages:

```
┌─────────────────────────────────────────┐
│ [FoodStore]  Menú  Mi Perfil  Mis Pedidos  Cart │ ← Customer Header (should NOT be here)
├──────────┬──────────────────────────────┤
│ Dashboard│                              │
│ Categorías│      Page Content            │ ← Admin sidebar + content
│ Ingredientes│     (via Outlet)           │
│ Productos │                              │
│ Alertas   │                              │
├──────────┴──────────────────────────────┤
│ ← Volver a la tienda                    │
└─────────────────────────────────────────┘
```

The goal is to remove the customer Header from admin pages so admin sees only the sidebar.

## Goals / Non-Goals

**Goals:**
- Admin routes (`/admin/*`) render WITHOUT the customer `<Header />` component
- Customer routes (`/`, `/productos/*`, `/profile`, `/orders`, `/cart`, etc.) continue to show `<Header />` exactly as before
- `AdminPage.tsx` continues to render its sidebar + `<Outlet />` as it currently does
- Minimal code changes — ideally only `App.tsx` route configuration
- All existing URLs remain the same
- `ProtectedRoute` guard on admin routes is preserved

**Non-Goals:**
- Redesigning the admin sidebar or its navigation items
- Changing the customer Header component
- Backend or API changes
- Adding new admin pages or functionality
- Changing the auth/permission model for admin access

## Decisions

### Decision 1: Extract admin routes from the shared Layout wrapper

**Choice**: Move `/admin/*` routes OUTSIDE of the `<Layout>` wrapper and make `AdminPage` a standalone top-level route element wrapped by `ProtectedRoute`.

**Rationale**: This is the simplest change with the least risk. `AdminPage.tsx` already renders a standalone layout with:
- Its own `min-h-screen` container
- Its own sidebar (`<aside>`)
- Its own `<Outlet />` for child routes

By extracting admin routes from Layout, we remove the customer Header without modifying any component code. The `ProtectedRoute` guard stays in place.

**Rejected alternatives:**
1. **Conditional hide in Layout**: Checking `location.pathname` inside Layout.tsx to conditionally render `<Header />` — adds unnecessary coupling and a conditional that needs maintenance as routes evolve
2. **New AdminLayout component**: Creating an `AdminLayout.tsx` that wraps AdminPage — would duplicate what AdminPage already does itself
3. **CSS display:none on admin routes**: Technical debt; hides the problem without fixing it

### Decision 2: Keep AdminPage as-is (no changes needed)

**Choice**: AdminPage.tsx requires zero modifications. It already has `min-h-screen`, a sidebar, and `<Outlet />` — it functions correctly as a standalone layout.

**Rationale**: The component was already designed as a full-page layout. The only issue was that it was nested inside another layout (Layout.tsx). Extracting it to the top level fixes the display without touching AdminPage code.

### Decision 3: Restructure routes with parallel top-level branches

**Choice**: The final route structure will have two parallel top-level branches:
- Customer branch: `Layout` (with Header) → public routes + protected customer routes
- Admin branch: `ProtectedRoute` → `AdminPage` (standalone) → admin sub-routes

**Current structure:**
```
<Routes>
  <Route element={<Layout />}>           ← Header wrapper
    <Route path="/" element={HomePage} />
    ...
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminPage />}>  ← Admin nested inside Layout
        <Route index element={AdminDashboard} />
        ...
      </Route>
    </Route>
  </Route>
</Routes>
```

**New structure:**
```
<Routes>
  <Route element={<Layout />}>           ← Header wrapper (customer only)
    <Route path="/" element={HomePage} />
    ...
    <Route element={<ProtectedRoute />}>
      <Route path="/profile" element={ProfilePage} />
      <Route path="/orders" element={OrdersPage} />
      ...
    </Route>
  </Route>

  <Route element={<ProtectedRoute />}>   ← Admin standalone (no Header)
    <Route path="/admin" element={<AdminPage />}>
      <Route index element={AdminDashboard} />
      <Route path="categories" element={CategoryListPage} />
      ...
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />  ← 404 at top level
</Routes>
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `NotFound` page currently inside Layout (has Header). After extraction, 404 on `/admin/xyz` won't have admin sidebar | Move `NotFound` route to the top level (outside both branches). It will show with customer Header, which is an acceptable experience for invalid URLs |
| An admin user navigating directly to `/admin` might briefly see a flash before ProtectedRoute validates | Pre-existing behavior; not introduced by this change |
| Customer Header styling depends on Layout container (`min-h-screen bg-[var(--bg)]`) | Layout container stays; only the Header position changes within the DOM tree |
