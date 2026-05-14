import { STATUS_LABELS, STATUS_STYLES, type OrderStatus } from '@shared/constants/orderStatus'

interface OrderStatusBadgeProps {
  status: string
  onClick?: () => void
}

export function OrderStatusBadge({ status, onClick }: OrderStatusBadgeProps) {
  const label = STATUS_LABELS[status as OrderStatus] ?? status
  const style = STATUS_STYLES[status as OrderStatus] ?? 'bg-gray-100 text-gray-800'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${style}`}
    >
      {label}
    </button>
  )
}
