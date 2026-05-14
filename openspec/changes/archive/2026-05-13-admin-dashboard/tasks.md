## 1. Setup — Dependencies and structure

- [ ] 1.1 Install `recharts` dependency: `cd frontend && npm install recharts`
- [ ] 1.2 Create directory structure: `features/admin/orders/components/` and `features/admin/orders/hooks/`

## 2. Admin Dashboard — KPIs and charts

- [ ] 2.1 Create `features/admin/Dashboard.tsx` as a modular component (extract from AdminDashboard.tsx) with:
  - KPI summary cards grid: Órdenes Hoy, Órdenes Pendientes, Ingresos Hoy, Productos Vendidos Hoy
  - Loading skeleton state per card
  - Error state with retry button
  - Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
- [ ] 2.2 Create `features/admin/hooks/useDashboardMetrics.ts` with parallel data fetching:
  - Fetch orders today (`GET /admin/pedidos?desde=today`)
  - Fetch pending orders count (`GET /admin/pedidos?estado=pendiente&limit=1`)
  - Fetch delivered orders today for revenue (`GET /admin/pedidos?desde=today&estado=entregado`)
  - Return aggregated KPIs (total orders, pending count, revenue sum, items count)
- [ ] 2.3 Create `features/admin/components/DashboardCharts.tsx` with Recharts:
  - OrdersByStatusChart: donut/pie chart showing order distribution by status
  - TopProductsChart: horizontal bar chart of top 5 selling products
  - Empty state when no data
- [ ] 2.4 Create `features/admin/components/DashboardRecentOrders.tsx`:
  - Table of 5 most recent orders with status badges
  - Click row navigates to `/admin/orders/{id}`
  - Empty state message when no orders
- [ ] 2.5 Update `AdminDashboard.tsx` to import and render the new Dashboard component

## 3. Admin Orders — Feature structure and hooks

- [ ] 3.1 Create `features/admin/orders/hooks/useAdminOrders.ts`:
  - `useAdminOrdersList(page, filters)`: paginated list from `GET /admin/pedidos` with status and date range filters
  - `useAdminOrderDetail(id)`: single order with items from `GET /pedidos/{id}`
  - `useAdminOrderHistory(id)`: order history from `GET /pedidos/{id}/history`
  - `useUpdateOrderStatus()`: mutation for `PATCH /pedidos/{id}/status` with `nuevo_estado` and optional `reason`
- [ ] 3.2 Define the valid status transitions as a constant (matching backend `OrderStateMachine`):
  - `pendiente → confirmado, cancelado`
  - `confirmado → preparando, cancelado`
  - `preparando → enviado`
  - `enviado → entregado`
  - Terminal states: `entregado`, `cancelado` (no transitions out)

## 4. Admin Orders — List page

- [ ] 4.1 Create `features/admin/orders/components/OrdersTable.tsx`:
  - Paginated table with columns: ID (truncated), Cliente, Estado (colored badge), Total ($), Fecha, Acciones
  - Loading skeleton, empty state ("No se encontraron pedidos" with clear filters button), error state with retry
- [ ] 4.2 Create `features/admin/orders/components/OrdersFilters.tsx`:
  - Status dropdown filter (all statuses as options)
  - Date range picker (from/to date inputs)
  - Search input for client name/email (debounced)
  - URL sync: filters reflected in query params
- [ ] 4.3 Create `features/admin/orders/index.tsx` (AdminOrderListPage):
  - Integrate OrdersFilters + OrdersTable
  - Pagination controls
  - Quick action: click status badge opens inline status change
- [ ] 4.4 Create `features/admin/orders/components/OrderStatusBadge.tsx`:
  - Colored badge per status (matching existing customer OrderTimeline colors)
  - Clickable variant that opens the status change modal

## 5. Admin Orders — Detail page

- [ ] 5.1 Create `features/admin/orders/components/OrderDetailInfo.tsx`:
  - Order header: ID, status badge, created date, total
  - Customer info section: name, email, delivery address
  - Items table: product name, quantity, unit price, subtotal per row, grand total
  - Payment info section: payment status badge, method, amount
- [ ] 5.2 Create `features/admin/orders/components/OrderStatusModal.tsx`:
  - Modal showing valid target states for current order status
  - Radio/button group for status selection
  - Optional "Razón del cambio" textarea
  - Confirmation step before executing
  - Success toast and error toast feedback
  - Loading state during API call
- [ ] 5.3 Create `features/admin/orders/components/OrderAdminTimeline.tsx`:
  - Extended timeline showing all status transitions with actor, timestamp, reason
  - Reuses or extends the customer `OrderTimeline` component
- [ ] 5.4 Create the admin order detail page (exported from `features/admin/orders/` as `AdminOrderDetailPage`):
  - Fetches order detail + history in parallel
  - Renders OrderDetailInfo + OrderAdminTimeline
  - Status change button opens OrderStatusModal
  - Loading skeleton, not-found state, error state

## 6. Routing and Navigation

- [ ] 6.1 Import `AdminOrderListPage` and `AdminOrderDetailPage` in `App.tsx`
- [ ] 6.2 Add routes under the admin `<Route>` block:
  - `<Route path="orders" element={<AdminOrderListPage />} />`
  - `<Route path="orders/:id" element={<AdminOrderDetailPage />} />`
- [ ] 6.3 Update `features/admin/Dashboard.tsx` "Ver todos" link to point to `/admin/orders`
- [ ] 6.4 Update `AdminPage.tsx`:
  - Add `{ to: '/admin/orders', label: 'Pedidos', end: false }` to `navItems` between Productos and Alertas de Stock
  - Add `useQuery` to fetch pending orders count (`GET /admin/pedidos?estado=pendiente&limit=1`) with 60s refetch
  - Show amber badge with pending count next to "Pedidos" label (similar to stock alerts badge but amber color)

## 7. Verification

- [ ] 7.1 Run `npm run build` in frontend to verify no TypeScript or build errors
- [ ] 7.2 Verify all admin routes render correctly: `/admin`, `/admin/orders`, `/admin/orders/:id`
- [ ] 7.3 Verify sidebar shows "Pedidos" with correct active state styling
- [ ] 7.4 Verify dashboard KPIs load and display correctly with real data
- [ ] 7.5 Verify order list pagination and filters work end-to-end
- [ ] 7.6 Verify order status change flow works end-to-end (modal → API → refresh)
- [ ] 7.7 Verify responsive layout at mobile, tablet, and desktop breakpoints
