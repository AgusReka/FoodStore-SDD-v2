export interface FiltersRowProps {
  activeFilters: string[]
  onToggle: (key: string) => void
}

interface FilterDef {
  key: string
  label: string
  icon: React.ReactNode
}

const FILTERS: FilterDef[] = [
  {
    key: 'quick',
    label: 'Bajo 20 min',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    key: 'vegan',
    label: 'Vegano',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    key: 'trending',
    label: 'Trending',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    key: 'new',
    label: 'Nuevos',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
      </svg>
    ),
  },
]

export function FiltersRow({ activeFilters, onToggle }: FiltersRowProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-2">
      {FILTERS.map((filter) => {
        const isActive = activeFilters.includes(filter.key)
        return (
          <button
            key={filter.key}
            onClick={() => onToggle(filter.key)}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-[180ms] var(--ease-out) cursor-pointer ${
              isActive
                ? 'bg-[var(--brand-soft)] text-[var(--brand-ink)] border border-transparent'
                : 'bg-[var(--bg-elevated)] text-[var(--ink-2)] border border-[var(--line)] hover:border-[var(--brand-soft)] hover:text-[var(--brand-ink)]'
            }`}
          >
            {filter.icon}
            {filter.label}
            {isActive && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
