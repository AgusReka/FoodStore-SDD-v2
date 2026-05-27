import { NewOrderAlert } from './NewOrderAlert'
import { OrderCard } from './OrderCard'
import type { KDSOrderRead } from '../hooks/useKDS'

interface KDSBoardProps {
  orders: KDSOrderRead[]
  porPreparar: number
  enPreparacion: number
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  lastEvent: string | null
  onStatusUpdate: (orderId: string, newStatus: 'preparando' | 'enviado') => void
}

const statusIndicator = {
  connecting: { dot: 'bg-yellow-400', label: 'Conectando...' },
  connected: { dot: 'bg-emerald-400', label: 'Conectado' },
  disconnected: { dot: 'bg-red-400', label: 'Desconectado' },
}

export function KDSBoard({
  orders,
  porPreparar,
  enPreparacion,
  connectionStatus,
  lastEvent,
  onStatusUpdate,
}: KDSBoardProps) {
  const confirmados = orders.filter((o) => o.estado === 'confirmado')
  const preparando = orders.filter((o) => o.estado === 'preparando')
  const indicator = statusIndicator[connectionStatus]

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className={`inline-block h-2 w-2 rounded-full ${indicator.dot} ${connectionStatus === 'disconnected' ? 'animate-pulse' : ''}`} />
            {indicator.label}
          </span>
          <NewOrderAlert lastEvent={lastEvent} />
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>Por preparar: {porPreparar}</span>
          <span>En preparación: {enPreparacion}</span>
        </div>
      </div>

      {/* Board columns */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:flex-row">
        {/* Por preparar */}
        <div className="flex flex-1 flex-col">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Por preparar
            {confirmados.length > 0 && (
              <span className="ml-auto rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                {confirmados.length}
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {confirmados.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center">
                <p className="text-sm text-zinc-600">No hay pedidos pendientes</p>
              </div>
            ) : (
              confirmados.map((order) => (
                <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
              ))
            )}
          </div>
        </div>

        {/* En preparación */}
        <div className="flex flex-1 flex-col">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            En preparación
            {preparando.length > 0 && (
              <span className="ml-auto rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                {preparando.length}
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto">
            {preparando.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center">
                <p className="text-sm text-zinc-600">No hay pedidos en preparación</p>
              </div>
            ) : (
              preparando.map((order) => (
                <OrderCard key={order.id} order={order} onStatusUpdate={onStatusUpdate} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
