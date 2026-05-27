import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/Button'

interface NewOrderAlertProps {
  orderId: string
  numero: number | null
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 8_000

export function NewOrderAlert({ orderId, numero, onDismiss }: NewOrderAlertProps) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation on mount
    requestAnimationFrame(() => setVisible(true))

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300) // wait for exit animation
    }, AUTO_DISMISS_MS)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleView = () => {
    setVisible(false)
    setTimeout(() => {
      onDismiss()
      navigate(`/admin/orders/${orderId}`)
    }, 300)
  }

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-5 py-3 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-1.5">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">¡Nuevo pedido!</p>
            <p className="text-green-100 text-xs truncate">
              {numero ? `Pedido #${numero}` : 'Nuevo pedido recibido'}
            </p>
          </div>
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-gray-600 text-sm mb-4">
            Un nuevo pedido ha sido registrado y está esperando confirmación.
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={handleView}
          >
            Ver pedido
          </Button>
        </div>
      </div>
    </div>
  )
}
