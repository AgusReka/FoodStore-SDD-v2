import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { CONFIG } from '@shared/config/brand'
import type { ProductRaw } from '@entities/product'
import { normalizeProduct } from '@entities/product'

interface ProductDetailModalProps {
  productId: string | null
  onClose: () => void
}

const ART_VARIANTS = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#44B09E'],
  ['#A8E6CF', '#DCEDC1'],
  ['#FFD93D', '#FF6B6B'],
  ['#6C5CE7', '#A29BFE'],
  ['#FF9FF3', '#F368E0'],
  ['#0ABDE3', '#48DBFB'],
  ['#FF6348', '#FF7F50'],
]

function foodArtGradient(id: string): [string, string] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ART_VARIANTS[Math.abs(hash) % ART_VARIANTS.length]
  return [colors[0], colors[1]]
}

function Stars({ rating = 4.5 }: { rating?: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.3
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full'
    if (i === full && hasHalf) return 'half'
    return 'empty'
  })

  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {stars.map((type, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={type === 'full' ? 'var(--warm-yellow)' : type === 'half' ? 'url(#halfStarModal)' : 'var(--line)'} stroke={type === 'empty' ? 'var(--ink-4)' : 'none'} strokeWidth={type === 'empty' ? 1.5 : 0}>
          {type === 'half' && (
            <defs>
              <linearGradient id="halfStarModal">
                <stop offset="50%" stopColor="var(--warm-yellow)" />
                <stop offset="50%" stopColor="var(--line)" />
              </linearGradient>
            </defs>
          )}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="t-caption" style={{ marginLeft: 4, fontSize: 12, color: 'var(--ink-2)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'close':
      return (<svg {...props}><path d="M6 6l12 12M6 18L18 6" /></svg>)
    case 'minus':
      return (<svg {...props}><path d="M6 12h12" /></svg>)
    case 'plus':
      return (<svg {...props}><path d="M12 6v12M6 12h12" /></svg>)
    case 'clock':
      return (<svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>)
    default:
      return null
  }
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { isMobile } = useBreakpoint()
  const addItem = useCartStore((s) => s.addItem)
  const accessToken = useAuthStore((s) => s.accessToken)
  const addToast = useUiStore((s) => s.addToast)
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await get<ProductRaw>(ENDPOINTS.PRODUCTS_DETAIL(productId!))
      return normalizeProduct(res.data)
    },
    enabled: !!productId,
  })

  const handleAddToCart = useCallback(() => {
    if (!product) return
    if (!accessToken) {
      onClose()
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }, quantity)
    addToast({ type: 'success', message: `${product.name} agregado al carrito` })
    onClose()
  }, [product, accessToken, addItem, quantity, onClose, addToast])

  const isAvailable = product?.isAvailable && (product?.stockDisponible == null || product?.stockDisponible > 0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (productId) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [productId, onClose])

  if (!productId) return null

  const modalContent = () => {
    if (isLoading) {
      return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 28px' }}>
          <div style={{ height: 24, width: 100, background: 'var(--line)', borderRadius: 999, marginBottom: 24, animation: 'pulse-soft 1.5s ease-in-out infinite' }} />
          <div style={{ aspectRatio: '1/1', background: 'var(--line)', borderRadius: 'var(--r-lg)', marginBottom: 24, animation: 'pulse-soft 1.5s ease-in-out infinite' }} />
          <div className="space-y-3">
            <div style={{ height: 28, width: '70%', background: 'var(--line)', borderRadius: 8 }} />
            <div style={{ height: 16, width: '30%', background: 'var(--line)', borderRadius: 8 }} />
            <div style={{ height: 16, width: '100%', background: 'var(--line)', borderRadius: 8 }} />
            <div style={{ height: 16, width: '80%', background: 'var(--line)', borderRadius: 8 }} />
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 28px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(230,57,70,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="close" size={24} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4 }}>Error al cargar el producto</p>
          <p className="t-caption" style={{ marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>{(error as Error).message}</p>
        </div>
      )
    }

    if (!product) {
      return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 28px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="close" size={24} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4 }}>Producto no encontrado</p>
          <p className="t-caption" style={{ marginBottom: 20 }}>El producto que buscás no existe o fue eliminado.</p>
          <Link to="/" className="btn btn-primary" onClick={onClose}>Volver al inicio</Link>
        </div>
      )
    }

    const [c1, c2] = foodArtGradient(product.id)

    /* ---- Desktop: Centered modal ---- */
    if (!isMobile) {
      return (
        <div
          style={{
            width: '100%',
            maxWidth: 680,
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-float)',
            overflow: 'hidden',
            animation: 'float-up 400ms var(--ease-out)',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
            aria-label="Cerrar"
          >
            <Icon name="close" size={18} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div
              style={{
                aspectRatio: '1/1',
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 72, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>
                  {product.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                {product.stockDisponible != null && product.stockDisponible <= 5 && product.stockDisponible > 0 && (
                  <span className="t-eyebrow" style={{ fontSize: 10, color: 'var(--danger)', marginBottom: 4, display: 'inline-block' }}>
                    QUEDAN {product.stockDisponible} UNIDADES
                  </span>
                )}
                <h1 className="t-h2" style={{ fontSize: 26, margin: 0 }}>{product.name}</h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Stars rating={4.5} />
                <span className="t-caption" style={{ color: 'var(--ink-3)' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="clock" size={14} />
                  <span className="t-caption">20-30 min</span>
                </div>
              </div>

              {product.description && (
                <p className="t-body" style={{ fontSize: 14, margin: 0 }}>{product.description}</p>
              )}

              {product.ingredientes && product.ingredientes.length > 0 && (
                <div>
                  <p className="t-caption" style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ingredientes
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {product.ingredientes.map((ing) => (
                      <span
                        key={ing.ingredientId}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          background: 'var(--surface)',
                          color: 'var(--ink-2)',
                        }}
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink-1)', fontFamily: 'var(--ff-display)' }}>
                    ${product.price.toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}
                  </span>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'var(--surface)', borderRadius: 999, height: 36 }}>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      style={{
                        width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
                        color: quantity <= 1 ? 'var(--ink-4)' : 'var(--ink-2)',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background var(--d-fast) var(--ease-out)',
                      }}
                      onMouseEnter={(e) => { if (quantity > 1) e.currentTarget.style.background = 'var(--line)' }}
                      onMouseLeave={(e) => { if (quantity > 1) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon name="minus" size={16} />
                    </button>
                    <span style={{ width: 32, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      style={{
                        width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
                        color: 'var(--ink-2)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background var(--d-fast) var(--ease-out)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 999,
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    background: isAvailable ? 'var(--brand)' : 'var(--line)',
                    color: isAvailable ? 'white' : 'var(--ink-3)',
                    boxShadow: isAvailable ? 'var(--shadow-brand)' : 'none',
                    transition: 'all var(--d-fast) var(--ease-out)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isAvailable ? (
                    <>Agregar · ${(product.price * quantity).toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}</>
                  ) : 'Producto no disponible'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    /* ---- Mobile: Bottom sheet ---- */
    return (
      <div
        style={{
          background: 'var(--bg-elevated)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'float-up 320ms var(--ease-out)',
          maxHeight: '93vh',
          overflow: 'hidden',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            maxHeight: '40vh',
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 80, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label="Cerrar"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {product.stockDisponible != null && product.stockDisponible <= 5 && product.stockDisponible > 0 && (
            <span className="t-eyebrow" style={{ fontSize: 10, color: 'var(--danger)' }}>
              QUEDAN {product.stockDisponible} UNIDADES
            </span>
          )}

          <h1 className="t-h2" style={{ fontSize: 24, margin: 0 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Stars rating={4.5} />
            <span className="t-caption">·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={14} />
              <span className="t-caption">20-30 min</span>
            </div>
          </div>

          {product.description && (
            <p className="t-body" style={{ fontSize: 14, margin: 0 }}>{product.description}</p>
          )}

          {product.ingredientes && product.ingredientes.length > 0 && (
            <div>
              <p className="t-caption" style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ingredientes
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.ingredientes.map((ing) => (
                  <span key={ing.ingredientId} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, background: 'var(--surface)', color: 'var(--ink-2)' }}>
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-1)', fontFamily: 'var(--ff-display)' }}>
              ${product.price.toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'var(--surface)', borderRadius: 999, height: 36 }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
                  color: quantity <= 1 ? 'var(--ink-4)' : 'var(--ink-2)',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="minus" size={16} />
              </button>
              <span style={{ width: 32, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
                  color: 'var(--ink-2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 999,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              background: isAvailable ? 'var(--brand)' : 'var(--line)',
              color: isAvailable ? 'white' : 'var(--ink-3)',
              boxShadow: isAvailable ? 'var(--shadow-brand)' : 'none',
              transition: 'all var(--d-fast) var(--ease-out)',
              marginBottom: 16,
            }}
          >
            {isAvailable
              ? `Agregar · ${(product.price * quantity).toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}`
              : 'Producto no disponible'}
          </button>
        </div>
      </div>
    )
  }

  /* ---- Wrapper ---- */
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {modalContent()}
      </div>
    )
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(20,16,12,0.36)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      {modalContent()}
    </div>
  )
}
