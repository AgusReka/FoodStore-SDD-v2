import type { Product } from './index'
import { ProductCard } from '@widgets/ProductCard'

export interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
  onProductClick?: (id: string) => void
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="animate-pulse bg-white rounded-xl border border-gray-200 overflow-hidden"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
    >
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

function ProductCardWrapper({ product, onProductClick }: { product: Product; onProductClick?: (id: string) => void }) {
  const content = <ProductCard product={product} />

  if (!onProductClick) return <div className="cursor-default">{content}</div>

  return (
    <div
      className="cursor-pointer"
      onClick={() => onProductClick(product.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProductClick(product.id) } }}
    >
      {content}
    </div>
  )
}

export function ProductGrid({ products, isLoading, error, onRetry, onProductClick }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[var(--ink-1)] mb-1">Error al cargar productos</p>
        <p className="text-sm text-[var(--ink-3)] mb-6 max-w-xs">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[var(--ink-1)] mb-1">No hay productos disponibles</p>
        <p className="text-sm text-[var(--ink-3)]">Intentá ajustar los filtros o volvé más tarde.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-[fade-in_360ms_ease-out_forwards]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <ProductCardWrapper product={product} onProductClick={onProductClick} />
        </div>
      ))}
    </div>
  )
}
