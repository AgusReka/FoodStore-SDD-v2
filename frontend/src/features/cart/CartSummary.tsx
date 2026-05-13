import { useMemo } from 'react'
import { useCartStore } from '@shared/stores/cartStore'

const DELIVERY_FEE = 450
const FREE_DELIVERY_THRESHOLD = 5000

interface CartSummaryProps {
  onCheckout: () => void
  isCheckingOut?: boolean
}

export function CartSummary({ onCheckout, isCheckingOut = false }: CartSummaryProps) {
  const total = useCartStore((s) => s.total)
  const itemCount = useCartStore((s) => s.itemCount)

  const delivery = useMemo(() => {
    if (total >= FREE_DELIVERY_THRESHOLD) return 0
    return DELIVERY_FEE
  }, [total])

  const grandTotal = total + delivery

  const progressPercent = useMemo(() => {
    return Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100)
  }, [total])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>

      {/* Free delivery progress */}
      {total < FREE_DELIVERY_THRESHOLD && (
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[var(--brand)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {delivery === 0
              ? '¡Envío gratis!'
              : `Te faltan $${(FREE_DELIVERY_THRESHOLD - total).toLocaleString('es-AR', { minimumFractionDigits: 2 })} para envío gratis`}
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Productos ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span>{delivery === 0 ? <span className="text-green-600 font-medium">Gratis</span> : `$${delivery.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>${grandTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="w-full mt-6 py-3 px-6 rounded-xl text-base font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCheckingOut ? 'Verificando...' : 'Ir al checkout'}
      </button>
    </div>
  )
}
