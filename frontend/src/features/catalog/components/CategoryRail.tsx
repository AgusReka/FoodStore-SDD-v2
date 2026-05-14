import type { Category } from '@entities/category'

export interface CategoryRailProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (categoryId: string | null) => void
}

const ART_VARIANTS = ['citrus', 'tomato', 'berry', 'green', 'cream', 'choco', 'matcha', 'purple'] as const

function hashArt(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
  return ART_VARIANTS[Math.abs(hash) % ART_VARIANTS.length]
}

export function CategoryRail({ categories, selectedId, onSelect }: CategoryRailProps) {
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
        {/* "Todas" button */}
        <button
          onClick={() => onSelect(null)}
          className={`inline-flex items-center gap-2 h-[52px] px-5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-[180ms] var(--ease-out) cursor-pointer shrink-0 ${
            selectedId === null
              ? 'bg-[var(--ink-1)] text-white shadow-lg -translate-y-0.5'
              : 'bg-[var(--bg-elevated)] text-[var(--ink-2)] border border-[var(--line)] shadow-xs hover:border-[var(--brand-soft)] hover:text-[var(--brand-ink)]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--ink-3)] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          Todas
        </button>

        {categories.map((category) => {
          const isActive = selectedId === category.id
          const artClass = hashArt(category.id)
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`inline-flex items-center gap-2 h-[52px] px-5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-[180ms] var(--ease-out) cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[var(--ink-1)] text-white shadow-lg -translate-y-0.5'
                  : 'bg-[var(--bg-elevated)] text-[var(--ink-2)] border border-[var(--line)] shadow-xs hover:border-[var(--brand-soft)] hover:text-[var(--brand-ink)]'
              }`}
            >
              <div className={`food-art ${artClass} w-8 h-8 rounded-full shrink-0`}>
                <span className="label" style={{ display: 'none' }} />
              </div>
              {category.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
