import { useMemo } from 'react'
import { useCartStore } from '@shared/stores/cartStore'
import { CONFIG } from '@shared/config/brand'

/* ============================================================
   ShippingBar — Live free delivery progress bar
   Shows animated progress toward free delivery threshold.
   ============================================================ */

export function ShippingBar() {
  const total = useCartStore((s) => s.total)
  const itemCount = useCartStore((s) => s.itemCount)

  const { progress, remaining, isFree } = useMemo(() => {
    const p = Math.min((total / CONFIG.freeDeliveryAt) * 100, 100)
    const rem = Math.max(CONFIG.freeDeliveryAt - total, 0)
    return { progress: p, remaining: rem, isFree: total >= CONFIG.freeDeliveryAt }
  }, [total])

  if (itemCount === 0) return null

  return (
    <div className="space-y-2">
      {/* Progress track */}
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: 'var(--line)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            width: `${progress}%`,
            background: isFree
              ? 'var(--success)'
              : 'linear-gradient(90deg, var(--brand), var(--warm-yellow))',
            transition: 'width var(--d-med) var(--ease-out), background var(--d-med) var(--ease-out)',
          }}
        />
      </div>

      {/* Label */}
      <p
        className="t-caption"
        style={{
          color: isFree ? 'var(--success)' : 'var(--ink-3)',
          fontWeight: isFree ? 600 : 400,
          transition: 'color var(--d-fast) var(--ease-out)',
        }}
      >
        {isFree ? (
          <>🎉 ¡Envío gratis!</>
        ) : (
          <>
            Te faltan{' '}
            <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>
              ${remaining.toLocaleString(CONFIG.locale, { minimumFractionDigits: 0 })}
            </span>{' '}
            para envío gratis
          </>
        )}
      </p>
    </div>
  )
}
