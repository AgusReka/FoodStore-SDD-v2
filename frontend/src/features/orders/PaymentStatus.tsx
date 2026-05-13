interface PaymentStatusProps {
  method: string
  status: string
  amount: number
}

const METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

const METHOD_ICONS: Record<string, string> = {
  efectivo: '💵',
  transferencia: '🏦',
  mercadopago: '🟡',
}

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado: 'bg-green-100 text-green-800 border-green-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200',
  reembolsado: 'bg-blue-100 text-blue-800 border-blue-200',
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  reembolsado: 'Reembolsado',
}

export function PaymentStatus({ method, status, amount }: PaymentStatusProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Pago
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{METHOD_ICONS[method] ?? '💳'}</span>
            <span className="text-sm font-medium text-gray-900">
              {METHOD_LABELS[method] ?? method}
            </span>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monto</span>
          <span className="font-semibold text-gray-900">
            ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}
