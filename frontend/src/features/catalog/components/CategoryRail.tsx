import type { Category } from '@entities/category'

export interface CategoryRailProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryRail({ categories, selectedId, onSelect }: CategoryRailProps) {
  return (
    <div className="w-full px-1">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedId === null
              ? 'bg-[var(--brand)] text-white'
              : 'bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--brand-soft)]'
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedId === category.id
                ? 'bg-[var(--brand)] text-white'
                : 'bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--brand-soft)]'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
