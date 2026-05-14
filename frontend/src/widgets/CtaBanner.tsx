export function CtaBanner() {
  return (
    <section className="container py-12 md:py-20">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--ink-1)] min-h-[280px] md:min-h-[320px] flex items-center">
        {/* FoodArt green gradient decorative overlay */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(80% 70% at 70% 50%, rgba(94,138,58,0.3), transparent 70%), radial-gradient(50% 60% at 90% 30%, rgba(182,224,138,0.15), transparent 60%)',
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
          }}
        />

        <div className="relative z-10 px-8 md:px-16 py-12 md:py-16 max-w-2xl">
          <p className="section-eyebrow text-[var(--brand)] mb-3">ESPECIAL</p>
          <h2 className="text-white t-display text-[clamp(32px,4vw,48px)] leading-[1.04] mb-4">
            Descubrí nuestra<br />
            selección especial
          </h2>
          <p className="text-[var(--ink-3)] text-base leading-relaxed mb-8 max-w-md">
            Platos exclusivos preparados por nuestros chefs destacados. Ingredientes frescos,
            recetas únicas y el mejor sabor de Mendoza.
          </p>
          <button className="btn" style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)' }}>
            Explorar menú
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
