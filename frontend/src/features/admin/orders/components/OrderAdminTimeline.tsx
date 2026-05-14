import { STATUS_LABELS, STATUS_STYLES, type OrderStatus } from '@shared/constants/orderStatus'
import type { OrderHistoryEntry } from '../hooks/useAdminOrders'

interface OrderAdminTimelineProps {
  entries: OrderHistoryEntry[] | undefined
  isLoading: boolean
}

export function OrderAdminTimeline({ entries, isLoading }: OrderAdminTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Historial del pedido
        </h3>
        <p className="text-sm text-gray-400">Sin registros de cambios</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Historial del pedido
      </h3>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_STYLES[entry.from_status as OrderStatus] ?? 'bg-gray-100 text-gray-800'
                }`}>
                  {STATUS_LABELS[entry.from_status as OrderStatus] ?? entry.from_status}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_STYLES[entry.to_status as OrderStatus] ?? 'bg-gray-100 text-gray-800'
                }`}>
                  {STATUS_LABELS[entry.to_status as OrderStatus] ?? entry.to_status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-500">
                <span>
                  {new Date(entry.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {entry.changed_by && (
                  <>
                    <span>·</span>
                    <span>Por: {entry.changed_by.slice(0, 8)}…</span>
                  </>
                )}
                {entry.reason && (
                  <>
                    <span>·</span>
                    <span className="text-gray-600 italic">"{entry.reason}"</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
