import { STATUS_LABELS } from '@shared/constants/orderStatus'

interface OrderHistoryEntry {
  id: string
  from_status: string
  to_status: string
  changed_by: string | null
  reason: string | null
  created_at: string
}

interface OrderHistoryProps {
  entries: OrderHistoryEntry[]
}

export function OrderHistory({ entries }: OrderHistoryProps) {
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
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 text-sm">
            <div className="mt-1.5 w-2 h-2 rounded-full bg-[var(--brand)] flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">
                {STATUS_LABELS[entry.from_status as keyof typeof STATUS_LABELS] ?? entry.from_status} → {STATUS_LABELS[entry.to_status as keyof typeof STATUS_LABELS] ?? entry.to_status}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                <span>
                  {new Date(entry.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {entry.reason && (
                  <>
                    <span>·</span>
                    <span>{entry.reason}</span>
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
