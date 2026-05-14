export type OrderStatus =
  | 'pendiente'
  | 'pending_mp'
  | 'confirmado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  pending_mp: 'Pendiente de pago',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const STATUS_ORDER: Record<OrderStatus, number> = {
  pendiente: 0,
  pending_mp: 0,
  confirmado: 1,
  preparando: 2,
  enviado: 3,
  entregado: 4,
  cancelado: -1,
}

export const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pending_mp: 'bg-orange-100 text-orange-800',
  confirmado: 'bg-blue-100 text-blue-800',
  preparando: 'bg-purple-100 text-purple-800',
  enviado: 'bg-cyan-100 text-cyan-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export const STATUS_TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'preparando', label: 'Preparando' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
]

export function getValidTransitions(status: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pendiente: ['confirmado', 'cancelado'],
    pending_mp: ['confirmado', 'cancelado'],
    confirmado: ['preparando', 'cancelado'],
    preparando: ['enviado'],
    enviado: ['entregado'],
    entregado: [],
    cancelado: [],
  }
  return transitions[status] ?? []
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'entregado' || status === 'cancelado'
}
