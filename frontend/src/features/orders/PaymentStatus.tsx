import { useState } from 'react'
import { post } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'

interface PaymentStatusProps {
  method: string
  status: string
  amount: number
  paymentId?: string
  mpInitPoint?: string | null
}

const METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

const METHOD_ICONS: Record<string, string> = {
  efectivo: '💵',
  transferencia: '🏦',
  mercadopago: '🟡',
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  reembolsado: 'Reembolsado',
}

export function PaymentStatus({ method, status, amount, paymentId, mpInitPoint }: PaymentStatusProps) {
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const needsMpAction = method === 'mercadopago' && (status === 'pendiente' || status === 'rechazado')

  const handlePayNow = async () => {
    setPaying(true)
    setPayError(null)

    try {
      if (mpInitPoint) {
        // We already have a checkout URL — redirect directly
        window.location.href = mpInitPoint
        return
      }

      if (paymentId) {
        // Create a new preference for the existing payment (retry)
        const response = await post<{ init_point: string }>(
          ENDPOINTS.PAYMENTS_MP_RETRY_PREFERENCE,
          { payment_id: paymentId }
        )
        window.location.href = response.data.init_point
      }
    } catch {
      setPayError('No pudimos conectar con Mercado Pago. Intentá de nuevo más tarde.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ink-3)',
        margin: '0 0 16px',
      }}>
        Pago
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{METHOD_ICONS[method] ?? '💳'}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>
              {METHOD_LABELS[method] ?? method}
            </span>
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 999,
            border: '1px solid',
            ...(status === 'aprobado'
              ? { background: 'rgba(94,138,58,0.12)', color: 'var(--leaf)', borderColor: 'rgba(94,138,58,0.2)' }
              : status === 'rechazado'
                ? { background: 'rgba(230,57,70,0.1)', color: 'var(--warm-red)', borderColor: 'rgba(230,57,70,0.2)' }
                : { background: 'rgba(255,201,58,0.15)', color: '#7A5500', borderColor: 'rgba(255,201,58,0.2)' }
            ),
          }}>
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--ink-2)' }}>Monto</span>
          <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>
            ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {needsMpAction && (
          <>
            <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
            <button
              type="button"
              onClick={handlePayNow}
              disabled={paying}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 999,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: paying ? 'not-allowed' : 'pointer',
                background: paying ? 'var(--line)' : 'var(--brand)',
                color: paying ? 'var(--ink-3)' : 'white',
                boxShadow: paying ? 'none' : 'var(--shadow-brand)',
                transition: 'all var(--d-fast) var(--ease-out)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {paying ? (
                <>
                  <span className="animate-spin" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
                  Procesando…
                </>
              ) : (
                'Pagar ahora con Mercado Pago'
              )}
            </button>
            {payError && (
              <p style={{ fontSize: 12.5, color: 'var(--warm-red)', margin: 0 }}>{payError}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
