import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@shared/components/Skeleton'
import { STATUS_STYLES, STATUS_LABELS, type OrderStatus } from '@shared/constants/orderStatus'
import type { OrderRead } from '../hooks/useAdminOrders'

interface OrdersTableProps {
  orders: OrderRead[]
  isLoading: boolean
  isError: boolean
  total: number
  page: number
  size: number
  onPageChange: (page: number) => void
  onRetry: () => void
  onStatusClick: (order: OrderRead) => void
}

export function OrdersTable({
  orders,
  isLoading,
  isError,
  total,
  page,
  size,
  onPageChange,
  onRetry,
  onStatusClick,
}: OrdersTableProps) {
  const navigate = useNavigate()
  const totalPages = Math.max(1, Math.ceil(total / size))

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-sm text-red-500">Error al cargar los pedidos</p>
        <button onClick={onRetry} className="mt-2 text-sm text-blue-600 underline">
          Reintentar
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm text-gray-500">No se encontraron pedidos</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {order.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusClick(order)
                    }}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  ${order.total.toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/orders/${order.id}`)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {total === 1 ? '1 pedido' : `${total.toLocaleString('es-AR')} pedidos`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-600">
            Pág. {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
