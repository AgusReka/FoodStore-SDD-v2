import { CONFIG } from '@shared/config/brand'

interface HeroProps {
  popularProduct?: { name: string } | null
}

function Hi({ n, s = 20 }: { n: string; s?: number }) {
  const p = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (n) {
    case 'star': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    case 'timer': return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
    case 'truck':
      return (
        <svg {...p}>
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      )
    default: return null
  }
}

export function Hero({ popularProduct }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="stagger space-y-6 lg:space-y-7">
            {/* Season badge */}
            <span className="chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
              </svg>
              Nueva temporada
            </span>

            <h1
              className="t-display"
              style={{ fontSize: 'clamp(40px,5.4vw,64px)', lineHeight: 1.04, letterSpacing: '-0.03em', maxWidth: 540 }}
            >
              Comida que llega<br />
              <span className="bg-gradient-to-r from-[#FF9933] to-[#FF5E00] bg-clip-text text-transparent">
                en su mejor momento
              </span>
            </h1>

            <p className="t-body text-[var(--ink-3)]" style={{ maxWidth: 440 }}>
              {CONFIG.brandTagline}
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary btn-lg">
                Pedir ahora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button className="btn btn-glass btn-lg">Cómo funciona</button>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 t-caption text-[var(--ink-2)]">
                <Hi n="timer" s={16} />
                <span className="num">18</span>
                <span className="hidden sm:inline"> min entrega promedio</span>
              </div>
              <div className="w-px h-4 bg-[var(--line)]" />
              <div className="flex items-center gap-2 t-caption text-[var(--ink-2)]">
                <Hi n="star" s={16} />
                <span className="num">4.9</span>
                <span className="hidden sm:inline"> rating</span>
              </div>
              <div className="w-px h-4 bg-[var(--line)]" />
              <div className="flex items-center gap-2 t-caption text-[var(--ink-2)]">
                <Hi n="truck" s={16} />
                <span className="num">42</span>
                <span className="hidden sm:inline"> cocinas curadas</span>
              </div>
            </div>
          </div>

          {/* Right column — FoodArt + floating chips */}
          <div className="relative flex items-center justify-center">
            <div className="food-art citrus w-full max-w-md aspect-square rounded-2xl shadow-xl relative overflow-hidden">
              <span className="label">FoodStore</span>
            </div>

            {/* Popular product floating chip */}
            {popularProduct && (
              <div
                className="glass hidden sm:flex absolute -left-2 lg:-left-6 bottom-12 lg:bottom-20 px-4 py-3 rounded-xl shadow-lg items-center gap-3"
                style={{ animation: 'float-up 0.7s var(--ease-out) 0.3s both' }}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <div className="t-caption font-semibold text-[var(--ink-1)]">{popularProduct.name}</div>
                  <div className="t-caption text-[var(--ink-3)]">El más popular</div>
                </div>
              </div>
            )}

            {/* Delivery floating chip */}
            <div
              className="glass hidden sm:flex absolute -right-2 lg:-right-6 top-12 lg:top-20 px-4 py-3 rounded-xl shadow-lg items-center gap-3"
              style={{ animation: 'float-up 0.7s var(--ease-out) 0.5s both' }}
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)]">
                <Hi n="truck" s={18} />
              </div>
              <div>
                <div className="t-caption font-semibold text-[var(--ink-1)]">Envío gratis</div>
                <div className="t-caption text-[var(--ink-3)]">+{CONFIG.currency}{CONFIG.freeDeliveryAt.toLocaleString(CONFIG.locale)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
