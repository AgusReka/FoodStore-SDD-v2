import { useState, useCallback } from 'react'
import { useAdminOrdersList, useUpdateOrderStatus } from './hooks/useAdminOrders'
import { OrdersTable } from './components/OrdersTable'
import { OrdersFilters } from './components/OrdersFilters'
import { OrderStatusModal } from './components/OrderStatusModal'
import type { OrderRead } from './hooks/useAdminOrders'

const PAGE_SIZE = 20

export function AdminOrderListPage() {
  // Filters state
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState<string | null>(null)
  const [desde, setDesde] = useState<string | null>(null)
  const [hasta, setHasta] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Status modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Queries
  const { data, isLoading, isError, refetch } = useAdminOrdersList({
    page,
    size: PAGE_SIZE,
    estado,
    desde: desde ? `${desde}T00:00:00Z` : null,
    hasta: hasta ? `${hasta}T23:59:59Z` : null,
  })

  const updateStatusMutation = useUpdateOrderStatus()

  const orders = data?.items ?? []
  const total = data?.total ?? 0

  // Handlers
  const handleStatusClick = useCallback((order: OrderRead) => {
    setSelectedOrder(order)
    setStatusError(null)
    setStatusModalOpen(true)
  }, [])

  const handleStatusConfirm = useCallback(async (newStatus: string, reason?: string) => {
    if (!selectedOrder) return

    setStatusError(null)
    try {
      await updateStatusMutation.mutateAsync({
        orderId: selectedOrder.id,
        data: { status: newStatus, reason },
      })
      setStatusModalOpen(false)
      setSelectedOrder(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar el estado'
      setStatusError(message)
    }
  }, [selectedOrder, updateStatusMutation])

  const handleClearFilters = useCallback(() => {
    setEstado(null)
    setDesde(null)
    setHasta(null)
    setSearch('')
    setPage(1)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona todos los pedidos del sistema
        </p>
      </div>

      {/* Filters */}
      <OrdersFilters
        estado={estado}
        desde={desde}
        hasta={hasta}
        search={search}
        onEstadoChange={(v) => { setEstado(v); setPage(1) }}
        onDesdeChange={(v) => { setDesde(v); setPage(1) }}
        onHastaChange={(v) => { setHasta(v); setPage(1) }}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        isError={isError}
        total={total}
        page={page}
        size={PAGE_SIZE}
        onPageChange={setPage}
        onRetry={() => refetch()}
        onStatusClick={handleStatusClick}
      />

      {/* Status Change Modal */}
      {selectedOrder && (
        <OrderStatusModal
          isOpen={statusModalOpen}
          onClose={() => { setStatusModalOpen(false); setSelectedOrder(null); setStatusError(null) }}
          currentStatus={selectedOrder.status}
          onConfirm={handleStatusConfirm}
          isPending={updateStatusMutation.isPending}
          error={statusError}
        />
      )}
    </div>
  )
}
