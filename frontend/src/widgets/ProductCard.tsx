import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@entities/product'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'

interface ProductCardProps {
  product: Product
}

function StockBadge({ product }: { product: Product }) {
  const stock = product.stockDisponible

  if (stock == null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        Sin stock
      </span>
    )
  }

  if (stock <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Sin stock
      </span>
    )
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        Últimas {stock} unidades
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      En stock
    </span>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAvailable = product.isAvailable && (product.stockDisponible == null || product.stockDisponible > 0)

  const handleAddToCart = useCallback(() => {
    if (!accessToken) {
      navigate(`/login?redirect=/productos/${product.id}`)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }, [addItem, product, accessToken, navigate])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽</span>
          </div>
        )}
        {/* Stock badge */}
        <div className="absolute top-2 right-2">
          <StockBadge product={product} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Ingredients list */}
        {product.ingredientes && product.ingredientes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400">
              {product.ingredientes.map((i) => i.name).join(', ')}
            </p>
          </div>
        )}

        {/* Price & Add to cart */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isAvailable
                ? 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] active:bg-[var(--brand-hover)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label={isAvailable ? `Agregar ${product.name} al carrito` : `${product.name} no disponible`}
          >
            {isAvailable ? 'Agregar' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  )
}
