import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminOrderDetail, useAdminOrderHistory, useUpdateOrderStatus } from './hooks/useAdminOrders'
import { OrderDetailInfo } from './components/OrderDetailInfo'
import { OrderAdminTimeline } from './components/OrderAdminTimeline'
import { OrderStatusModal } from './components/OrderStatusModal'
import { Button } from '@shared/components/Button'

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Queries
  const { data: order, isLoading: orderLoading, isError: orderError, refetch: refetchOrder } = useAdminOrderDetail(id)
  const { data: history, isLoading: historyLoading } = useAdminOrderHistory(id)

  // Status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const updateStatusMutation = useUpdateOrderStatus()

  const handleStatusClick = useCallback(() => {
    setStatusError(null)
    setStatusModalOpen(true)
  }, [])

  const handleStatusConfirm = useCallback(async (newStatus: string, reason?: string) => {
    if (!id) return

    setStatusError(null)
    try {
      await updateStatusMutation.mutateAsync({
        orderId: id,
        data: { status: newStatus, reason },
      })
      setStatusModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar el estado'
      setStatusError(message)
    }
  }, [id, updateStatusMutation])

  if (orderError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Error al cargar el pedido</p>
        <Button onClick={() => refetchOrder()}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a pedidos
      </button>

      {/* Order detail */}
      <OrderDetailInfo
        order={order}
        isLoading={orderLoading}
        onStatusClick={handleStatusClick}
      />

      {/* Change status button */}
      {order && !orderLoading && (
        <div className="flex justify-end">
          <Button onClick={handleStatusClick}>
            Cambiar Estado
          </Button>
        </div>
      )}

      {/* Timeline / History */}
      <OrderAdminTimeline
        entries={history}
        isLoading={historyLoading}
      />

      {/* Status Change Modal */}
      {order && (
        <OrderStatusModal
          isOpen={statusModalOpen}
          onClose={() => { setStatusModalOpen(false); setStatusError(null) }}
          currentStatus={order.status}
          onConfirm={handleStatusConfirm}
          isPending={updateStatusMutation.isPending}
          error={statusError}
        />
      )}
    </div>
  )
}
