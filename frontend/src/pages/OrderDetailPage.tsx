import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useOrderDetail } from '@features/orders/hooks/useOrders'
import { OrderTimeline } from '@features/orders/OrderTimeline'
import { PaymentStatus } from '@features/orders/PaymentStatus'

function SkeletonBlock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  preparando: 'bg-purple-100 text-purple-800',
  enviado: 'bg-cyan-100 text-cyan-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNewOrder = searchParams.get('new') === 'true'

  const { data: order, isLoading, isError, refetch } = useOrderDetail(id)

  // Post-checkout success banner
  if (isNewOrder && order && !isLoading) {
    // Remove the query param after showing banner once
    window.history.replaceState({}, '', `/orders/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a mis pedidos
      </button>

      {/* Success banner (post-checkout) */}
      {order && isNewOrder && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">¡Pedido confirmado!</p>
            <p className="text-sm text-green-600">Tu pedido #{order.id.slice(-8).toUpperCase()} fue registrado con éxito.</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {id ? 'No encontramos este pedido' : 'Ocurrió un error al cargar el pedido'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Order detail */}
      {order && !isLoading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pedido #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span
                className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Estado del pedido
            </h2>
            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Productos
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Producto #{item.product_id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.unit_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          {order.payment ? (
            <PaymentStatus
              method={order.payment.payment_method}
              status={order.payment.status}
              amount={order.payment.amount}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Pago
              </h3>
              <p className="text-sm text-gray-500">Información de pago no disponible</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
