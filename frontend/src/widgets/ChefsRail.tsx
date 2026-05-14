const CHEFS = [
  { name: 'María García', specialty: 'Cocina Mendocina', rating: '4.9', art: 'citrus' },
  { name: 'Juan Pérez', specialty: 'Parrilla', rating: '4.8', art: 'tomato' },
  { name: 'Ana López', specialty: 'Pastelería', rating: '4.9', art: 'cream' },
  { name: 'Pedro Martínez', specialty: 'Cocina Vegana', rating: '4.7', art: 'green' },
  { name: 'Laura Sánchez', specialty: 'Comida Fusión', rating: '4.8', art: 'purple' },
  { name: 'Carlos Ruiz', specialty: 'Pasta Artesanal', rating: '4.9', art: 'berry' },
]

export function ChefsRail() {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-eyebrow mb-2">NUESTROS CHEFS</p>
          <h2 className="t-h2">Cocineros destacados</h2>
        </div>
        <button className="btn btn-ghost btn-sm hide-mobile">
          Ver todos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {/* Mobile: horizontal snap scroll — Desktop: grid */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 scrollbar-hide">
        {CHEFS.map((chef) => (
          <div
            key={chef.name}
            className="flex flex-col items-center gap-3 snap-start shrink-0 w-[140px] md:w-auto group cursor-pointer"
          >
            {/* FoodArt circular avatar */}
            <div className={`food-art ${chef.art} w-20 h-20 rounded-full shadow-md transition-transform duration-[320ms] var(--ease-out) group-hover:scale-105`}>
              <span className="label" style={{ display: 'none' }} />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--ink-1)] leading-tight">{chef.name}</p>
              <p className="text-[12px] text-[var(--ink-3)] leading-tight mt-0.5">{chef.specialty}</p>
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--warm-yellow)" stroke="var(--warm-yellow)" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[12px] font-semibold text-[var(--ink-1)] num">{chef.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-only "Ver todos" */}
      <div className="show-mobile justify-center mt-6">
        <button className="btn btn-ghost btn-sm">
          Ver todos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </section>
  )
}
