import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCustomerProductsList } from '@features/catalog/hooks/useCustomerProducts'
import { useCustomerCategoriesList } from '@features/catalog/hooks/useCustomerCategories'
import { SearchBar } from '@features/catalog/components/SearchBar'
import { CategoryRail } from '@features/catalog/components/CategoryRail'
import { ProductGrid } from '@entities/product/ProductGrid'
import { Hero } from '@widgets/Hero'
import { FiltersRow } from '@widgets/FiltersRow'
import { ChefsRail } from '@widgets/ChefsRail'
import { CtaBanner } from '@widgets/CtaBanner'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { Product } from '@entities/product'
import { useUiStore } from '@shared/stores/uiStore'

export default function HomePage() {
  const openProductModal = useUiStore((s) => s.openProductModal)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: productsRefetch,
  } = useCustomerProductsList(page, 12, search, selectedCategory)

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useCustomerCategoriesList()

  const { data: popularProduct } = useQuery<Product>({
    queryKey: ['product', 'popular'],
    queryFn: async () => {
      const res = await get<Product>(ENDPOINTS.PRODUCTS_POPULAR)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesData?.items ?? []
  const products = productsData?.items ?? []
  const total = productsData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 12))

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setPage(1)
  }, [])

  const handleProductClick = useCallback((id: string) => {
    openProductModal(id)
  }, [openProductModal])

  const handleFilterToggle = useCallback((key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    )
  }, [])

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="ambient" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Hero popularProduct={popularProduct} />

        {/* Trust Strip */}
        <section className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="t-display num text-2xl">18</div>
              <div className="t-caption">min entrega promedio</div>
            </div>
            <div className="text-center">
              <div className="t-display num text-2xl">4.9</div>
              <div className="t-caption">rating App Store</div>
            </div>
            <div className="text-center">
              <div className="t-display num text-2xl">42</div>
              <div className="t-caption">cocinas curadas</div>
            </div>
            <div className="text-center">
              <div className="t-display num text-2xl">500+</div>
              <div className="t-caption">platos disponibles</div>
            </div>
          </div>
        </section>

        {/* Search + Category + Filters */}
        <section className="container">
          <div className="mb-6 max-w-md">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>

          {categoriesLoading ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[52px] w-28 rounded-full bg-[var(--surface)] animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            <CategoryRail
              categories={categories}
              selectedId={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}

          <FiltersRow activeFilters={activeFilters} onToggle={handleFilterToggle} />
        </section>

        {/* Product Grid with stagger */}
        <section className="container py-8">
          <div className="stagger">
            <ProductGrid
              products={products}
              isLoading={productsLoading}
              error={productsError}
              onRetry={() => productsRefetch()}
              onProductClick={handleProductClick}
            />
          </div>

          {/* Pagination — Mesa styled */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-4 mt-10 pb-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`btn btn-sm ${page <= 1 ? 'btn-ghost opacity-40' : 'btn-primary'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Anterior
              </button>
              <span className="t-caption num">Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`btn btn-sm ${page >= totalPages ? 'btn-ghost opacity-40' : 'btn-primary'}`}
              >
                Siguiente
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}
        </section>

        <ChefsRail />
        <CtaBanner />
      </div>
    </div>
  )
}
