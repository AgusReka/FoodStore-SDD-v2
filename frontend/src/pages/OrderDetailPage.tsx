import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useOrderDetail, useOrderHistory } from '@features/orders/hooks/useOrders'
import { OrderTimeline } from '@features/orders/OrderTimeline'
import { PaymentStatus } from '@features/orders/PaymentStatus'
import { OrderHistory } from '@features/orders/OrderHistory'
import { STATUS_LABELS, type OrderStatus } from '@shared/constants/orderStatus'
import { CONFIG } from '@shared/config/brand'

/* ── Mesa-style status badge ── */
const STATUS_MESA_STYLES: Record<string, React.CSSProperties> = {
  pendiente: {
    background: 'rgba(255,201,58,0.18)',
    color: '#7A5500',
  },
  confirmado: {
    background: 'rgba(94,138,58,0.12)',
    color: 'var(--leaf)',
  },
  preparando: {
    background: 'rgba(201,166,240,0.18)',
    color: '#4A2D7A',
  },
  enviado: {
    background: 'rgba(94,138,58,0.12)',
    color: 'var(--leaf)',
  },
  entregado: {
    background: 'rgba(94,138,58,0.18)',
    color: '#2D5E1A',
  },
  cancelado: {
    background: 'rgba(230,57,70,0.12)',
    color: 'var(--warm-red)',
  },
}

function SkeletonBlock() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          width: 180,
          height: 20,
          borderRadius: 6,
          marginBottom: 16,
          background:
            'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            width: '100%',
            height: 14,
            borderRadius: 6,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.1s',
          }}
        />
        <div
          style={{
            width: '75%',
            height: 14,
            borderRadius: 6,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.2s',
          }}
        />
        <div
          style={{
            width: '55%',
            height: 14,
            borderRadius: 6,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.3s',
          }}
        />
      </div>
    </div>
  )
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNewOrder = searchParams.get('new') === 'true'
  const mpError = searchParams.get('mp-error') === 'true'
  const isPendingPayment = searchParams.get('pending') === 'true'

  const { data: order, isLoading, isError, refetch } = useOrderDetail(id)
  const { data: history } = useOrderHistory(id)

  const [isPolling, setIsPolling] = useState(false)
  const pollAttempts = useRef(0)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll for pending MP payments after returning from MP redirect
  useEffect(() => {
    if (!order?.payment) return
    if (order.payment.payment_method !== 'mercadopago') return
    if (order.payment.status !== 'pendiente') return

    setIsPolling(true)
    pollAttempts.current = 0

    pollTimer.current = setInterval(async () => {
      pollAttempts.current++

      if (pollAttempts.current >= 10) {
        if (pollTimer.current) clearInterval(pollTimer.current)
        setIsPolling(false)
        return
      }

      const result = await refetch()
      const newStatus = result.data?.payment?.status
      if (newStatus && newStatus !== 'pendiente') {
        if (pollTimer.current) clearInterval(pollTimer.current)
        setIsPolling(false)
      }
    }, 3000)

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current)
        pollTimer.current = null
      }
      setIsPolling(false)
    }
  }, [order?.id, order?.payment?.status, order?.payment?.payment_method, refetch])

  // Post-checkout success banner — remove the query param after showing
  if (isNewOrder && order && !isLoading) {
    window.history.replaceState({}, '', `/orders/${id}`)
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/orders')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13.5,
          color: 'var(--ink-2)',
          marginBottom: 24,
          padding: '6px 12px',
          borderRadius: 999,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--line)',
          cursor: 'pointer',
          transition: 'all 180ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--ink-3)'
          e.currentTarget.style.color = 'var(--ink-1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--line)'
          e.currentTarget.style.color = 'var(--ink-2)'
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Volver a mis pedidos
      </button>

      {/* MP error banner */}
      {order && mpError && (
        <div
          style={{
            background: 'rgba(230,57,70,0.08)',
            border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 'var(--r-lg)',
            padding: 20,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'float-up 0.5s var(--ease-spring)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(230,57,70,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warm-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--warm-red)', margin: 0 }}>
              Pago con Mercado Pago no completado
            </p>
            <p style={{ fontSize: 13, color: '#7A2D2D', margin: '2px 0 0' }}>
              Usá el botón "Pagar ahora" de abajo para intentar de nuevo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.delete('mp-error')
              window.history.replaceState({}, '', url.pathname)
              window.location.reload()
            }}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid rgba(230,57,70,0.3)',
              background: 'transparent',
              color: 'var(--warm-red)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Entendido
          </button>
        </div>
      )}

      {/* Pending payment banner (efectivo / transferencia — post-checkout) */}
      {order && isNewOrder && isPendingPayment && (
        <div
          style={{
            background: 'rgba(255,201,58,0.12)',
            border: '1px solid rgba(255,201,58,0.25)',
            borderRadius: 'var(--r-lg)',
            padding: 20,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'float-up 0.5s var(--ease-spring)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,201,58,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7A5500"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: '#7A5500',
                margin: 0,
              }}
            >
              ¡Pedido registrado!
            </p>
            <p
              style={{
                fontSize: 13,
                color: '#5A3F00',
                margin: '2px 0 0',
              }}
            >
              Tu pedido #{order.id.slice(-8).toUpperCase()} fue registrado con
              éxito. El pago quedó pendiente — cuando el local confirme tu pedido
              te avisaremos.
            </p>
          </div>
        </div>
      )}

      {/* Success banner (MP post-checkout) */}
      {order && isNewOrder && !isPendingPayment && (
        <div
          style={{
            background: 'rgba(94,138,58,0.08)',
            border: '1px solid rgba(94,138,58,0.2)',
            borderRadius: 'var(--r-lg)',
            padding: 20,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            animation: 'float-up 0.5s var(--ease-spring)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(94,138,58,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'pulse-soft 0.6s var(--ease-spring) 0.3s',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--leaf)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--leaf)',
                margin: 0,
              }}
            >
              ¡Pedido confirmado!
            </p>
            <p
              style={{
                fontSize: 13,
                color: '#3D5E22',
                margin: '2px 0 0',
              }}
            >
              Tu pedido #{order.id.slice(-8).toUpperCase()} fue registrado con
              éxito.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <style>{`
            @keyframes shimmer {
              from { background-position: 200% 0; }
              to { background-position: -200% 0; }
            }
          `}</style>
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: 'rgba(230,57,70,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warm-red)',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink-1)',
              margin: '0 0 4px',
            }}
          >
            {id ? 'No encontramos este pedido' : 'Ocurrió un error'}
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink-3)',
              margin: '0 0 20px',
            }}
          >
            {id
              ? 'El pedido que buscás no existe o fue eliminado'
              : 'No pudimos cargar el pedido'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Order detail */}
      {order && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header card */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
                gap: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontWeight: 600,
                    fontSize: 22,
                    color: 'var(--ink-1)',
                    margin: 0,
                  }}
                >
                  Pedido{' '}
                  <span style={{ fontFamily: 'var(--ff-mono)', fontWeight: 500 }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    margin: '6px 0 0',
                  }}
                >
                  {new Date(order.created_at).toLocaleDateString(CONFIG.locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  ...(STATUS_MESA_STYLES[order.status] ?? {
                    background: 'var(--surface)',
                    color: 'var(--ink-2)',
                  }),
                }}
              >
                {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 16,
                borderTop: '1px solid var(--line)',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Total</span>
              <span
                className="num"
                style={{
                  fontFamily: 'var(--ff-display)',
                  fontWeight: 600,
                  fontSize: 26,
                  color: 'var(--ink-1)',
                  letterSpacing: '-0.02em',
                }}
              >
                {CONFIG.currency}
                {order.total.toLocaleString(CONFIG.locale, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                margin: '0 0 16px',
              }}
            >
              Estado del pedido
            </h3>
            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                margin: '0 0 16px',
              }}
            >
              Productos
            </h3>
            <div>
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 0',
                    borderTop: index === 0 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  {/* FoodArt placeholder */}
                  <div
                    className="food-art citrus"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 'var(--r-md)',
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--ink-1)',
                        margin: 0,
                      }}
                    >
                      Producto #
                      {item.product_id.slice(-6).toUpperCase()}
                    </p>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--ink-3)',
                        margin: '2px 0 0',
                      }}
                    >
                      {CONFIG.currency}
                      {item.unit_price.toLocaleString(CONFIG.locale, {
                        minimumFractionDigits: 2,
                      })}{' '}
                      c/u × {item.quantity}
                    </p>
                  </div>
                  <span
                    className="num"
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: 'var(--ink-1)',
                    }}
                  >
                    {CONFIG.currency}
                    {item.subtotal.toLocaleString(CONFIG.locale, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          {order.payment ? (
            <>
              <PaymentStatus
                method={order.payment.payment_method}
                status={order.payment.status}
                amount={order.payment.amount}
                paymentId={order.payment.id}
                mpInitPoint={order.payment.mp_init_point}
              />
              {isPolling && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className="animate-spin"
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid var(--line)',
                      borderTopColor: 'var(--brand)',
                      flexShrink: 0,
                    }}
                  />
                  Verificando pago…
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  margin: '0 0 8px',
                }}
              >
                Pago
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: 0 }}>
                Información de pago no disponible
              </p>
            </div>
          )}

          {/* Order History */}
          {history && <OrderHistory entries={history} />}
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
