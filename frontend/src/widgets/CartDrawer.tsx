import { useCallback, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { CONFIG } from '@shared/config/brand'
import { ShippingBar } from './ShippingBar'
import EmptyState from './EmptyState'

/* ============================================================
   FoodArt — Deterministic gradient avatars for cart items
   ============================================================ */
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

function foodArtGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ART_VARIANTS[Math.abs(hash) % ART_VARIANTS.length]
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
}

/* ============================================================
   Mesa Icon subset
   ============================================================ */
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
      return (
        <svg {...props}>
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...props}>
          <path d="M6 12h12" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 6v12M6 12h12" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...props}>
          <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        </svg>
      )
    case 'bag':
      return (
        <svg {...props}>
          <path d="M6 8h12l-1 12.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      )
    default:
      return null
  }
}

/* ============================================================
   Counter — Quantity stepper
   ============================================================ */
function Counter({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--surface)',
        borderRadius: 999,
        height: 32,
      }}
    >
      <button
        type="button"
        onClick={onDecrement}
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          border: 'none',
          background: 'transparent',
          color: 'var(--ink-2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background var(--d-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icon name={value <= 1 ? 'trash' : 'minus'} size={16} />
      </button>
      <span
        style={{
          width: 28,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ink-1)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          border: 'none',
          background: 'transparent',
          color: 'var(--ink-2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background var(--d-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

/* ============================================================
   CartDrawer — Full Mesa cart overlay
   Desktop: right drawer 460px | Mobile: full-screen
   ============================================================ */
export function CartDrawer() {
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const cartOpen = useUiStore((s) => s.cartOpen)
  const setCartOpen = useUiStore((s) => s.setCartOpen)
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const itemCount = useCartStore((s) => s.itemCount)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const isAuthenticated = useAuthStore((s) => !!s.accessToken)

  const [tip, setTip] = useState(0)
  const [stockErrors, setStockErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Reset tip when cart opens
  useEffect(() => {
    if (cartOpen) setTip(0)
  }, [cartOpen])

  // Close on Escape key
  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  const handleClose = useCallback(() => setCartOpen(false), [setCartOpen])

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      setCartOpen(false)
      navigate('/login')
      return
    }

    setStockErrors([])
    setIsValidating(true)

    try {
      const { get } = await import('@shared/api/client')
      const { ENDPOINTS } = await import('@shared/api/endpoints')

      const errors: string[] = []
      for (const item of items) {
        try {
          const response = await get<{ stock_disponible: number | null }>(
            ENDPOINTS.PRODUCTS_STOCK(item.productId)
          )
          const stock = response.data.stock_disponible
          if (stock != null && stock < item.quantity) {
            errors.push(
              stock <= 0
                ? `"${item.name}" se agotó`
                : `"${item.name}" solo tiene ${stock} unidades disponibles (pediste ${item.quantity})`
            )
          }
        } catch {
          errors.push(`No se pudo verificar stock de "${item.name}"`)
        }
      }

      if (errors.length > 0) {
        setStockErrors(errors)
        return
      }

      setCartOpen(false)
      navigate('/checkout')
    } finally {
      setIsValidating(false)
    }
  }, [items, isAuthenticated, navigate, setCartOpen])

  const deliveryFee = total >= CONFIG.freeDeliveryAt ? 0 : CONFIG.deliveryFee
  const tipAmount = Math.round(total * (tip / 100))
  const grandTotal = total + deliveryFee + tipAmount

  const formatPrice = (n: number) =>
    `$${n.toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}`

  // Content rendered both in drawer (desktop) and page (mobile)
  const cartContent = (
    <>
      {/* Items */}
      {items.length === 0 ? (
        <div style={{ padding: '0 24px' }}>
          <EmptyState
            icon={<Icon name="bag" size={40} />}
            title="Tu carrito está vacío"
            description="Agregá productos del menú para empezar tu pedido"
            action={{ label: 'Ver menú', onClick: () => { setCartOpen(false); navigate('/') } }}
          />
        </div>
      ) : (
        <div className="space-y-3" style={{ padding: '0 24px' }}>
          {items.map((item) => {
            const itemTotal = item.price * item.quantity
            return (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-elevated)',
                  boxShadow: 'var(--shadow-xs)',
                  border: '1px solid var(--line)',
                }}
              >
                {/* FoodArt */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--r-sm)',
                    background: foodArtGradient(item.productId),
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 700,
                    fontFamily: 'var(--ff-display)',
                  }}
                >
                  {item.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink-1)',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </p>
                  <p className="t-caption" style={{ marginBottom: 8 }}>
                    {formatPrice(item.price)} c/u
                  </p>
                  <Counter
                    value={item.quantity}
                    onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
                    onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
                  />
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: 72 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--ink-1)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatPrice(itemTotal)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stock errors */}
      {stockErrors.length > 0 && (
        <div style={{ padding: '0 24px' }} className="space-y-2">
          {stockErrors.map((err, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(230,57,70,0.08)',
                border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--danger)',
              }}
              role="alert"
            >
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Fee breakdown */}
      {items.length > 0 && (
        <div style={{ padding: '0 24px' }} className="space-y-3">
          <ShippingBar />

          <div style={{ height: 1, background: 'var(--line)' }} />

          <div className="space-y-2">
            <FeeRow label="Subtotal" value={formatPrice(total)} />
            <FeeRow
              label="Envío"
              value={deliveryFee === 0 ? 'Gratis' : formatPrice(deliveryFee)}
              valueColor={deliveryFee === 0 ? 'var(--success)' : undefined}
            />
            {/* Tip selector inline */}
            <div style={{ paddingTop: 4, paddingBottom: 4 }}>
              <TipSelectorInline tip={tip} onTipChange={setTip} />
            </div>
            {tip > 0 && (
              <FeeRow
                label={`Propina (${tip}%)`}
                value={formatPrice(tipAmount)}
              />
            )}
            <div style={{ height: 1, background: 'var(--line-strong)' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--ink-1)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ink-1)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )

  const isDisabled = isValidating || items.length === 0

  const footerCta = items.length > 0 && (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--line)',
      }}
    >
      <button
        onClick={handleCheckout}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 999,
          border: 'none',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          background: isDisabled ? 'var(--line)' : 'var(--brand)',
          color: isDisabled ? 'var(--ink-3)' : 'white',
          boxShadow: isDisabled ? 'none' : 'var(--shadow-brand)',
          transition: 'all var(--d-fast) var(--ease-out)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isValidating ? (
          <>
            <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
            Verificando stock…
          </>
        ) : isAuthenticated ? (
          `Ir al checkout · ${formatPrice(grandTotal)}`
        ) : (
          'Iniciar sesión para comprar'
        )}
      </button>
    </div>
  )

  /* ---- DESKTOP: right drawer ---- */
  if (!isMobile) {
    if (!cartOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(20,16,12,0.36)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'fade-in 180ms var(--ease-out)',
          }}
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 460,
            maxWidth: '100vw',
            zIndex: 91,
            background: 'var(--bg-elevated)',
            boxShadow: 'var(--shadow-float)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slide-in-right 320ms var(--ease-out)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <h2
              className="t-h3"
              style={{ fontSize: 20, margin: 0 }}
            >
              Tu carrito
              {itemCount > 0 && (
                <span className="t-caption" style={{ marginLeft: 8, fontWeight: 400 }}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
            <button
              onClick={handleClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 'none',
                background: 'var(--surface)',
                color: 'var(--ink-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background var(--d-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              aria-label="Cerrar carrito"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }} className="space-y-5">
            {cartContent}
          </div>

          {/* Footer CTA */}
          {footerCta}
        </div>
      </>
    )
  }

  /* ---- MOBILE: full-screen page ---- */
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 91,
        background: 'var(--bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'float-up 320ms var(--ease-out)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <h2
          className="t-h3"
          style={{ fontSize: 18, margin: 0 }}
        >
          Tu carrito
          {itemCount > 0 && (
            <span className="t-caption" style={{ marginLeft: 8, fontWeight: 400 }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </h2>
        <button
          onClick={handleClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 'none',
            background: 'var(--surface)',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Cerrar carrito"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }} className="space-y-5">
        {cartContent}
      </div>

      {/* Footer CTA */}
      {footerCta}
    </div>
  )
}

/* ============================================================
   FeeRow — Simple label + value line
   ============================================================ */
function FeeRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: valueColor ?? 'var(--ink-1)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

/* ============================================================
   TipSelectorInline — Compact row of tip pills for drawer
   ============================================================ */
function TipSelectorInline({
  tip,
  onTipChange,
}: {
  tip: number
  onTipChange: (pct: number) => void
}) {
  const total = useCartStore((s) => s.total)

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      {CONFIG.tipOptions.map((pct) => {
        const amount = Math.round(total * (pct / 100))
        const active = tip === pct
        return (
          <button
            key={pct}
            type="button"
            onClick={() => onTipChange(pct)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: 'none',
              fontSize: 12.5,
              fontWeight: active ? 600 : 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: active ? 'var(--brand)' : 'var(--surface)',
              color: active ? 'white' : 'var(--ink-2)',
              transition: 'all var(--d-fast) var(--ease-out)',
              display: 'inline-flex',
              gap: 4,
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = 'var(--line)'
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <span>{pct === 0 ? 'Sin' : `${pct}%`}</span>
            {pct > 0 && (
              <span style={{ opacity: 0.7 }}>
                ${amount.toLocaleString(CONFIG.locale, { minimumFractionDigits: 0 })}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
