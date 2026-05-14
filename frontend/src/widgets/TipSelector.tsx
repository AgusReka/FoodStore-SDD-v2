import { useMemo } from 'react'
import { useCartStore } from '@shared/stores/cartStore'
import { CONFIG } from '@shared/config/brand'

/* ============================================================
   TipSelector — Mesa tip percentage pill selector
   Options: 0%, 10%, 15%, 20% (from CONFIG.tipOptions)
   ============================================================ */

interface TipSelectorProps {
  tip: number
  onTipChange: (percent: number) => void
}

export function TipSelector({ tip, onTipChange }: TipSelectorProps) {
  const total = useCartStore((s) => s.total)

  const options = CONFIG.tipOptions

  const tipAmounts = useMemo(
    () =>
      options.map((pct) => ({
        pct,
        amount: Math.round(total * (pct / 100)),
        label: pct === 0 ? 'Sin propina' : `${pct}%`,
      })),
    [options, total]
  )

  return (
    <div className="space-y-3">
      <p className="t-caption" style={{ fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Propina
      </p>
      <div className="flex gap-2 flex-wrap">
        {tipAmounts.map(({ pct, amount, label }) => (
          <button
            key={pct}
            type="button"
            onClick={() => onTipChange(pct)}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              fontSize: 13.5,
              fontWeight: tip === pct ? 600 : 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: tip === pct ? 'var(--brand)' : 'var(--surface)',
              color: tip === pct ? 'white' : 'var(--ink-2)',
              transition: 'all var(--d-fast) var(--ease-out)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
            onMouseEnter={(e) => {
              if (tip !== pct) e.currentTarget.style.background = 'var(--line)'
            }}
            onMouseLeave={(e) => {
              if (tip !== pct) e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <span>{label}</span>
            {pct > 0 && (
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                ${amount.toLocaleString(CONFIG.locale, { minimumFractionDigits: 0 })}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
