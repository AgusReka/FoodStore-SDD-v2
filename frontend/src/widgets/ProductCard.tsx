import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@entities/product'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'
import { CONFIG } from '@shared/config/brand'

interface ProductCardProps {
  product: Product
}

const ART_VARIANTS = ['citrus', 'tomato', 'berry', 'green', 'cream', 'choco', 'matcha', 'purple'] as const

function hashArt(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
  return ART_VARIANTS[Math.abs(hash) % ART_VARIANTS.length]
}

function StockBadgeMesa({ product }: { product: Product }) {
  const stock = product.stockDisponible

  if (stock == null || stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-[var(--warm-red)]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Sin stock
      </span>
    )
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01" />
        </svg>
        Últimas {stock}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-[var(--leaf)]">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      En stock
    </span>
  )
}

function Stars({ rating = 4.5 }: { rating?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--warm-yellow)' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--ink-1)' }} className="num">
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const accessToken = useAuthStore((s) => s.accessToken)
  const artVariant = hashArt(product.id)
  const isAvailable = product.isAvailable && (product.stockDisponible == null || product.stockDisponible > 0)

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
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
    <div
      className="group relative bg-[var(--bg-elevated)] rounded-2xl overflow-hidden transition-all duration-[360ms] var(--ease-out) hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl m-2">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[600ms] var(--ease-out) group-hover:scale-105"
          />
        ) : (
          <div className={`food-art ${artVariant} w-full h-full`}>
            <span className="label">{CONFIG.brand}</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 z-10">
          <StockBadgeMesa product={product} />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="absolute -bottom-5 right-3 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-[var(--brand)] text-white transition-all duration-[180ms] var(--ease-out) hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ boxShadow: 'var(--shadow-brand)' }}
          aria-label={isAvailable ? `Agregar ${product.name} al carrito` : `${product.name} no disponible`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="px-3 pb-3 pt-4">
        <h3 className="text-[16.5px] font-semibold text-[var(--ink-1)] leading-tight line-clamp-1 mb-0.5" style={{ fontFamily: 'var(--ff-display)' }}>
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-1.5">
          <Stars rating={4.5} />
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>·</span>
          <span className="inline-flex items-center gap-1" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
            20-30 min
          </span>
        </div>

        {product.description && (
          <p className="text-[13px] text-[var(--ink-3)] leading-snug line-clamp-2 mb-1.5">
            {product.description}
          </p>
        )}

        {product.ingredientes && product.ingredientes.length > 0 && (
          <p className="text-[11.5px] text-[var(--ink-4)] leading-snug mb-2">
            {product.ingredientes.map((i) => i.name).join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[17px] font-bold text-[var(--ink-1)] num">
            {CONFIG.currency}{product.price.toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}
