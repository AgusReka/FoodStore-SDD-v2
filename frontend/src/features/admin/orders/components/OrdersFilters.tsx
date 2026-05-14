import { STATUS_LABELS, type OrderStatus } from '@shared/constants/orderStatus'

const ALL_STATUSES = Object.entries(STATUS_LABELS) as [OrderStatus, string][]

interface OrdersFiltersProps {
  estado: string | null
  desde: string | null
  hasta: string | null
  search: string
  onEstadoChange: (estado: string | null) => void
  onDesdeChange: (desde: string | null) => void
  onHastaChange: (hasta: string | null) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export function OrdersFilters({
  estado,
  desde,
  hasta,
  search,
  onEstadoChange,
  onDesdeChange,
  onHastaChange,
  onSearchChange,
  onClear,
}: OrdersFiltersProps) {
  const hasFilters = estado || desde || hasta || search

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="order-search" className="block text-xs font-medium text-gray-500 mb-1">
            Buscar cliente
          </label>
          <input
            id="order-search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nombre o email..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="order-status" className="block text-xs font-medium text-gray-500 mb-1">
            Estado
          </label>
          <select
            id="order-status"
            value={estado ?? ''}
            onChange={(e) => onEstadoChange(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {ALL_STATUSES.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label htmlFor="order-from" className="block text-xs font-medium text-gray-500 mb-1">
            Desde
          </label>
          <input
            id="order-from"
            type="date"
            value={desde ?? ''}
            onChange={(e) => onDesdeChange(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="order-to" className="block text-xs font-medium text-gray-500 mb-1">
            Hasta
          </label>
          <input
            id="order-to"
            type="date"
            value={hasta ?? ''}
            onChange={(e) => onHastaChange(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
