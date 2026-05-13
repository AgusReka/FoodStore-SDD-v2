import { useNavigate } from 'react-router-dom'

interface OrderCardProps {
  order: {
    id: string
    status: string
    total: number
    currency: string
    created_at: string
    items: { quantity: number }[]
  }
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

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate()
  const shortId = order.id.slice(-8).toUpperCase()
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  const date = new Date(order.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      type="button"
      onClick={() => navigate(`/orders/${order.id}`)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-[var(--brand)] hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">Pedido #{shortId}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </p>
        <p className="text-base font-bold text-gray-900">
          ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </button>
  )
}
