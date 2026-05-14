import { STATUS_LABELS, STATUS_STYLES, type OrderStatus } from '@shared/constants/orderStatus'
import type { OrderRead } from '../hooks/useAdminOrders'
import { Skeleton } from '@shared/components/Skeleton'

interface OrderDetailInfoProps {
  order: OrderRead | undefined
  isLoading: boolean
  onStatusClick: () => void
}

export function OrderDetailInfo({ order, isLoading, onStatusClick }: OrderDetailInfoProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido no encontrado</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Creado el {new Date(order.created_at).toLocaleDateString('es-AR', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onStatusClick}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
            STATUS_STYLES[order.status as OrderStatus] ?? 'bg-gray-100 text-gray-800'
          }`}
        >
          {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Información del Pedido
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">ID completo</dt>
              <dd className="font-mono text-xs text-gray-700">{order.id}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Total</dt>
              <dd className="font-semibold text-gray-900">{formatCurrency(order.total)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Moneda</dt>
              <dd className="text-gray-700">{order.currency}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Items</dt>
              <dd className="text-gray-700">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</dd>
            </div>
          </dl>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Información de Pago
          </h3>
          {order.payment ? (
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Estado</dt>
                <dd>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.payment.status === 'aprobado' ? 'bg-green-100 text-green-800' :
                    order.payment.status === 'rechazado' ? 'bg-red-100 text-red-800' :
                    order.payment.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.payment.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Método</dt>
                <dd className="text-gray-700 capitalize">{order.payment.payment_method?.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Monto</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(order.payment.amount)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">Sin información de pago</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Productos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-900 font-medium">
                    {item.product_id.slice(0, 8)}…
                  </td>
                  <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="pt-3 text-right text-sm font-semibold text-gray-900">
                  Total
                </td>
                <td className="pt-3 text-right font-bold text-gray-900">
                  {formatCurrency(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
