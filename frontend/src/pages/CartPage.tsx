import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'
import { CartItem } from '@features/cart/CartItem'
import { CartSummary } from '@features/cart/CartSummary'

const CartPage = () => {
  const items = useCartStore((s) => s.items)
  const isAuthenticated = useAuthStore((s) => !!s.accessToken)
  const navigate = useNavigate()

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=%2Fcheckout')
      return
    }
    navigate('/checkout')
  }, [isAuthenticated, navigate])

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Agregá productos para empezar a comprar</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex px-6 py-3 rounded-xl text-base font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
        >
          Ver productos
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              productId={item.productId}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
            />
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
