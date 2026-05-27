import { useCallback, useState } from 'react'
import { patch } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { UrgencyTimer } from './UrgencyTimer'
import type { KDSOrderRead } from '../hooks/useKDS'

interface OrderCardProps {
  order: KDSOrderRead
  onStatusUpdate: (orderId: string, newStatus: 'preparando' | 'enviado') => void
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const [loading, setLoading] = useState(false)

  const handleStart = useCallback(async () => {
    setLoading(true)
    try {
      await patch(ENDPOINTS.COCINA_PEDIDOS_ESTADO(order.id), {
        nuevo_estado: 'preparando',
      })
      onStatusUpdate(order.id, 'preparando')
    } catch {
      console.error('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }, [order.id, onStatusUpdate])

  const handleDone = useCallback(async () => {
    setLoading(true)
    try {
      await patch(ENDPOINTS.COCINA_PEDIDOS_ESTADO(order.id), {
        nuevo_estado: 'enviado',
      })
      onStatusUpdate(order.id, 'enviado')
    } catch {
      console.error('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }, [order.id, onStatusUpdate])

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 shadow-lg transition-colors hover:border-zinc-600">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-100">
            {order.numero ? `Pedido #${order.numero}` : `Pedido ${order.id.slice(0, 8)}`}
          </h3>
        </div>
        <UrgencyTimer confirmedAt={order.confirmed_at} />
      </div>

      {/* Items */}
      <ul className="mb-3 space-y-2">
        {order.items.map((item, idx) => (
          <li key={idx} className="border-b border-zinc-700 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-zinc-200">
                <span className="mr-1 text-zinc-500">{item.cantidad}x</span>
                {item.nombre}
              </span>
              {/*<span className="text-xs text-zinc-500">${item.subtotal.toFixed(2)}</span>*/}
            </div>
            {item.personalizacion && item.personalizacion.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.personalizacion.map((p, i) => (
                  <span
                    key={i}
                    className="inline-block rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Notes */}
      {order.notas && (
        <div className="mb-3 rounded bg-zinc-700/50 p-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Notas:</span> {order.notas}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {order.estado === 'confirmado' && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Iniciar preparación'}
          </button>
        )}
        {order.estado === 'preparando' && (
          <button
            onClick={handleDone}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Listo'}
          </button>
        )}
      </div>
    </div>
  )
}
