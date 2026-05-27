import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { useAdminOrdersWS } from '@features/admin/orders/hooks/useAdminOrdersWS'
import { NewOrderAlert } from '@features/admin/orders/components/NewOrderAlert'

interface StockAlertList {
  total: number
}

interface PaginatedResponse {
  total: number
}

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/categories', label: 'Categorías', end: false },
  { to: '/admin/ingredients', label: 'Ingredientes', end: false },
  { to: '/admin/products', label: 'Productos', end: false },
  { to: '/admin/orders', label: 'Pedidos', end: false },
  { to: '/admin/stock-alerts', label: 'Alertas de Stock', end: false },
]

const AdminPage = () => {
  const { user } = useAuth()

  // Fetch alert count for sidebar badge
  const { data: alertData } = useQuery<StockAlertList>({
    queryKey: ['stock-alerts-count'],
    queryFn: async () => {
      const response = await get<StockAlertList>(ENDPOINTS.ADMIN_STOCK_ALERTS)
      return response.data
    },
    refetchInterval: 60_000,
  })

  // Fetch pending orders count for sidebar badge
  const { data: pendingOrdersData } = useQuery<PaginatedResponse>({
    queryKey: ['pending-orders-count'],
    queryFn: async () => {
      const response = await get<PaginatedResponse>(ENDPOINTS.ADMIN_ORDERS_LIST, { estado: 'pendiente', page: 1, size: 1 })
      return response.data
    },
    refetchInterval: 60_000,
  })

  const alertCount = alertData?.total ?? 0
  const pendingOrdersCount = pendingOrdersData?.total ?? 0

  const queryClient = useQueryClient()

  // WebSocket: refresh pending badge + show alert on new orders
  const { newOrder, dismissNewOrder } = useAdminOrdersWS(() => {
    queryClient.invalidateQueries({ queryKey: ['pending-orders-count'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{user?.first_name} {user?.last_name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1" aria-label="Navegación administrativa">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span>{item.label}</span>
              {item.label === 'Pedidos' && pendingOrdersCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {pendingOrdersCount}
                </span>
              )}
              {item.label === 'Alertas de Stock' && alertCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {alertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <NavLink
            to="/"
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            ← Volver a la tienda
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* New Order Alert — shown on all admin pages */}
      {newOrder && (
        <NewOrderAlert
          orderId={newOrder.orderId}
          numero={newOrder.numero}
          onDismiss={dismissNewOrder}
        />
      )}
    </div>
  )
}

export default AdminPage
