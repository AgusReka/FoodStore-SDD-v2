import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerProductsList } from '@features/catalog/hooks/useCustomerProducts'
import { useCustomerCategoriesList } from '@features/catalog/hooks/useCustomerCategories'
import { SearchBar } from '@features/catalog/components/SearchBar'
import { CategoryRail } from '@features/catalog/components/CategoryRail'
import { ProductGrid } from '@entities/product/ProductGrid'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)

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
    navigate(`/productos/${id}`)
  }, [navigate])

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[var(--brand-soft)] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ink-1)] mb-2">
            Descubre nuestros productos
          </h1>
          <p className="text-[var(--ink-3)] text-base">
            Los mejores ingredientes para tus platos favoritos
          </p>
        </div>

        <div className="mb-6">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>

        <div className="mb-8">
          {categoriesLoading ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 rounded-full bg-[var(--surface)] animate-pulse shrink-0"
                />
              ))}
            </div>
          ) : (
            <CategoryRail
              categories={categories}
              selectedId={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}
        </div>

        <ProductGrid
          products={products}
          isLoading={productsLoading}
          error={productsError}
          onRetry={() => productsRefetch()}
          onProductClick={handleProductClick}
        />

        {total > 12 && (
          <div className="flex items-center justify-center gap-4 mt-8 pb-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                page <= 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-[var(--ink-2)]">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                page >= totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
