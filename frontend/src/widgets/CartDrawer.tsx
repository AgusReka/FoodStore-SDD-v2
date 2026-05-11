import { useCallback, useState, useMemo } from 'react'
import { useCartStore } from '@shared/stores/cartStore'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/authStore'

interface StockValidationResult {
  product_id: string
  product_name: string
  error: string
}

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const itemCount = useCartStore((s) => s.itemCount)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const isAuthenticated = useAuthStore((s) => !!s.accessToken)
  const navigate = useNavigate()

  const [stockErrors, setStockErrors] = useState<StockValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setStockErrors([])
    setIsValidating(true)

    try {
      // Call stock validation for each item
      const errors: StockValidationResult[] = []
      const { get } = await import('@shared/api/client')
      const { ENDPOINTS } = await import('@shared/api/endpoints')

      for (const item of items) {
        try {
          const response = await get<{ stock_disponible: number | null }>(
            ENDPOINTS.PRODUCTS_STOCK(item.productId)
          )
          const stock = response.data.stock_disponible
          if (stock != null && stock < item.quantity) {
            errors.push({
              product_id: item.productId,
              product_name: item.name,
              error: stock <= 0
                ? `"${item.name}" se agotó`
                : `"${item.name}" solo tiene ${stock} unidades disponibles (pediste ${item.quantity})`,
            })
          }
        } catch {
          errors.push({
            product_id: item.productId,
            product_name: item.name,
            error: `No se pudo verificar stock de "${item.name}"`,
          })
        }
      }

      if (errors.length > 0) {
        setStockErrors(errors)
        return
      }

      // All valid — navigate to checkout
      onClose()
      navigate('/checkout')
    } finally {
      setIsValidating(false)
    }
  }, [items, isAuthenticated, navigate, onClose])

  const totalFormatted = useMemo(
    () => total.toLocaleString('es-AR', { minimumFractionDigits: 2, style: 'currency', currency: 'ARS' }),
    [total]
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Carrito ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-2">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm">Agregá productos para empezar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      aria-label={`Reducir cantidad de ${item.name}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stock errors */}
          {stockErrors.length > 0 && (
            <div className="mt-4 space-y-2">
              {stockErrors.map((err) => (
                <div
                  key={err.product_id}
                  className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {err.error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{totalFormatted}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isValidating}
              className={`
                w-full py-3 px-6 rounded-xl text-base font-semibold transition-colors
                ${isValidating
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }
              `}
            >
              {isValidating ? 'Verificando stock...' : isAuthenticated ? 'Ir al checkout' : 'Iniciar sesión para comprar'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
