import { useCallback } from 'react'
import type { Product } from '@entities/product'
import { useCartStore } from '@shared/stores/cartStore'

interface ProductDetailProps {
  product: Product
}

function StockIndicator({ product }: { product: Product }) {
  const stock = product.stockDisponible

  if (stock == null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true" />
        Stock no disponible
      </div>
    )
  }

  if (stock <= 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
        Sin stock
      </div>
    )
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-500" aria-hidden="true" />
        Quedan {stock} unidades
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
      <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
      En stock
    </div>
  )
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem)
  const isAvailable = product.isAvailable && (product.stockDisponible == null || product.stockDisponible > 0)

  const handleAddToCart = useCallback(() => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }, [addItem, product])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">
            🍽
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <StockIndicator product={product} />
        </div>

        {product.description && (
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Ingredients */}
        {product.ingredientes && product.ingredientes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Ingredientes</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredientes.map((ing) => (
                <span
                  key={ing.ingredientId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                >
                  {ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`
              w-full py-3 px-6 rounded-xl text-base font-semibold transition-colors
              ${isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label={isAvailable ? `Agregar ${product.name} al carrito` : `${product.name} no disponible`}
          >
            {isAvailable ? 'Agregar al carrito' : 'Producto no disponible'}
          </button>
        </div>
      </div>
    </div>
  )
}
