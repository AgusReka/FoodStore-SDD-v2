import { useEffect, useState } from 'react'
import { KDSBoard } from '@features/cocina/components/KDSBoard'
import { useKDS } from '@features/cocina/hooks/useKDS'

const CocinaPage = () => {
  const { orders, porPreparar, enPreparacion, connectionStatus, lastEvent } = useKDS()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-100">
            <span className="mr-2" role="img" aria-label="cocina">
              🍳
            </span>
            Cocina
          </h1>
        </div>
        <div className="text-sm font-medium text-zinc-500">
          {time.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-hidden">
        <KDSBoard
          orders={orders}
          porPreparar={porPreparar}
          enPreparacion={enPreparacion}
          connectionStatus={connectionStatus}
          lastEvent={lastEvent}
          onStatusUpdate={() => {
            // SSE handles updates; this is a no-op after local state change
          }}
        />
      </main>
    </div>
  )
}

export default CocinaPage
