import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
type ReturnStatus = 'success' | 'failure' | 'pending'

const STATUS_CONFIG: Record<ReturnStatus, { title: string; message: string; icon: string }> = {
  success: {
    title: 'Pago aprobado',
    message: 'Tu pago fue procesado correctamente. En unos minutos tu pedido estará en camino.',
    icon: '✓',
  },
  failure: {
    title: 'Pago rechazado',
    message: 'El pago no pudo ser procesado. Podés intentar con otro método de pago.',
    icon: '✕',
  },
  pending: {
    title: 'Pago pendiente',
    message: 'El pago está siendo procesado. Te notificaremos cuando se confirme.',
    icon: '⏳',
  },
}

const PaymentReturnPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status') as ReturnStatus | null
  const orderIdParam = searchParams.get('order_id')
  const status: ReturnStatus = statusParam ?? 'pending'
  const config = STATUS_CONFIG[status]

  useEffect(() => {
    if (status === 'success') {
      const target = orderIdParam ? `/orders/${orderIdParam}` : '/orders'
      const timer = setTimeout(() => {
        navigate(target, { replace: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, orderIdParam, navigate])

  /* ---- Styles ---- */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '32px 24px',
    textAlign: 'center',
  }

  const iconStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 700,
    color: 'white',
    marginBottom: 24,
    background:
      status === 'success'
        ? 'var(--success, #22c55e)'
        : status === 'failure'
          ? 'var(--danger, #e63946)'
          : 'var(--brand)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--ink-1)',
    marginBottom: 8,
  }

  const messageStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--ink-3)',
    maxWidth: 400,
    lineHeight: 1.5,
    marginBottom: 32,
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 28px',
    borderRadius: 999,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: 'var(--brand)',
    color: 'white',
    textDecoration: 'none',
    boxShadow: 'var(--shadow-brand)',
    transition: 'all var(--d-fast, 150ms) var(--ease-out, ease)',
  }

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    color: 'var(--ink-2)',
    boxShadow: 'none',
    border: '1px solid var(--line)',
    marginLeft: 12,
  }

  const successTarget = orderIdParam ? `/orders/${orderIdParam}` : '/orders'

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{config.icon}</div>
      <h1 style={titleStyle}>{config.title}</h1>
      <p style={messageStyle}>{config.message}</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {status === 'success' ? (
          <Link to={successTarget} style={buttonStyle}>
            Ver mis pedidos
          </Link>
        ) : (
          <>
            <Link to="/checkout" style={buttonStyle}>
              {status === 'failure' ? 'Intentar de nuevo' : 'Ir al checkout'}
            </Link>
            <Link to="/orders" style={secondaryButtonStyle}>
              Mis pedidos
            </Link>
          </>
        )}
      </div>

      {status === 'success' && (
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>
          Redirigiendo a tus pedidos en unos segundos...
        </p>
      )}
    </div>
  )
}

export default PaymentReturnPage
