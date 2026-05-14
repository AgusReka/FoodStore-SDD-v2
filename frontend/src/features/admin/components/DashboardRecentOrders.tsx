import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { queryKeys } from '@shared/api/queryKeys'
import { Skeleton } from '@shared/components/Skeleton'
import { STATUS_LABELS, STATUS_STYLES, type OrderStatus } from '@shared/constants/orderStatus'
import type { PaginatedResponse } from '@shared/api/client'

interface OrderRead {
  id: string
  status: string
  total: number
  created_at: string
  user_id: string
}

export function DashboardRecentOrders() {
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.admin.dashboard(), 'recent-orders'],
    queryFn: async () => {
      const res = await get<PaginatedResponse<OrderRead>>(
        ENDPOINTS.ADMIN_ORDERS_LIST,
        { page: 1, size: 5 }
      )
      return res.data
    },
  })

  const orders = data?.items ?? []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Pedidos Recientes
        </h3>
        <button
          onClick={() => navigate('/admin/orders')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todos →
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-6">
          <p className="text-sm text-red-500">Error al cargar pedidos recientes</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-blue-600 underline">Reintentar</button>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No hay pedidos recientes</p>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-gray-900">
                    ${order.total.toLocaleString('es-AR')}
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
