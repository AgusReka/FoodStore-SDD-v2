import { useCallback } from 'react'
import { useCartStore } from '@shared/stores/cartStore'

interface CartItemProps {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}

export function CartItem({ productId, name, price, quantity, imageUrl }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const subtotal = price * quantity

  const handleIncrement = useCallback(() => {
    updateQuantity(productId, quantity + 1)
  }, [updateQuantity, productId, quantity])

  const handleDecrement = useCallback(() => {
    if (quantity <= 1) {
      removeItem(productId)
    } else {
      updateQuantity(productId, quantity - 1)
    }
  }, [updateQuantity, removeItem, productId, quantity])

  const handleRemove = useCallback(() => {
    removeItem(productId)
  }, [removeItem, productId])

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🍽</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={`Reducir cantidad de ${name}`}
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-gray-900">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={`Aumentar cantidad de ${name}`}
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[80px]">
        <p className="text-sm font-semibold text-gray-900">
          ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={handleRemove}
        className="text-red-400 hover:text-red-600 transition-colors p-1"
        aria-label={`Eliminar ${name}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
