import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrdersList } from '@features/orders/hooks/useOrders'
import { OrderList } from '@entities/order/OrderList'

const STATUS_FILTERS = [
  { value: null, label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-36 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

const OrdersPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const size = 10

  const { data, isLoading, isError, refetch } = useOrdersList(page, size, statusFilter)

  const handleFilterChange = (value: string | null) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
      <p className="text-gray-500 mb-6">Historial de pedidos realizados</p>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value ?? 'all'}
            type="button"
            onClick={() => handleFilterChange(filter.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-[var(--brand)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Ocurrió un error al cargar tus pedidos</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          {statusFilter ? (
            <>
              <p className="text-gray-500 mb-1">No tenés pedidos con ese estado</p>
              <button
                type="button"
                onClick={() => handleFilterChange(null)}
                className="text-sm text-[var(--brand)] hover:underline"
              >
                Ver todos los pedidos
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-1">No tenés pedidos todavía</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
              >
                Ver productos
              </button>
            </>
          )}
        </div>
      )}

      {/* Order list */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <OrderList
          orders={data.items}
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default OrdersPage
