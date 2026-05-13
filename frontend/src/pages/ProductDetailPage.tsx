import { useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCustomerProductDetail } from '@features/catalog/hooks/useCustomerProductDetail'
import { ProductDetail } from '@entities/product/ProductDetail'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useCustomerProductDetail(id ?? null)

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  if (isLoading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-xl w-full mt-8 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[var(--ink-3)] hover:text-[var(--brand)] transition-colors mb-8 inline-block"
          >
            ← Volver al menú
          </button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[var(--ink-1)] mb-1">Error al cargar el producto</p>
            <p className="text-sm text-[var(--ink-3)] mb-6 max-w-xs">{error.message}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-[var(--bg)] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[var(--ink-3)] hover:text-[var(--brand)] transition-colors mb-8 inline-block"
          >
            ← Volver al menú
          </button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--ink-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[var(--ink-1)] mb-1">Producto no encontrado</p>
            <p className="text-sm text-[var(--ink-3)] mb-6">El producto que buscás no existe o fue eliminado.</p>
            <Link
              to="/"
              className="px-6 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-medium hover:bg-[var(--brand-hover)] transition-colors inline-block"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[var(--ink-3)] hover:text-[var(--brand)] transition-colors mb-6 inline-flex items-center gap-1"
        >
          ← Volver al menú
        </button>
        <ProductDetail product={product} />
      </div>
    </div>
  )
}
