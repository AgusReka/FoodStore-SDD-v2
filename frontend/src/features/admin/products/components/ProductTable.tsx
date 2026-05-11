import type { Product } from '@entities/product'
import { Pagination } from '@shared/components/Pagination'
import { Skeleton } from '@shared/components/Skeleton'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  total: number
  page: number
  size: number
  categoryNames: Record<string, string>
  onPageChange: (page: number) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

function StockDisplay({ product }: { product: Product }) {
  const stock = product.stockDisponible
  const hasIngredients = product.ingredientes && product.ingredientes.length > 0

  if (stock == null) {
    return <span className="text-sm text-gray-400">—</span>
  }

  const label = hasIngredients
    ? `${stock} uds. (calculado)`
    : `${stock} uds. (directo)`

  const isLow = stock <= 5
  const isOut = stock <= 0

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isOut
          ? 'bg-red-100 text-red-800'
          : isLow
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
      }`}
      title={isOut ? 'Sin stock' : isLow ? 'Stock bajo' : 'Stock disponible'}
    >
      {label}
    </span>
  )
}

export function ProductTable({
  products,
  isLoading,
  total,
  page,
  size,
  categoryNames,
  onPageChange,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TableSkeleton />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No hay productos</p>
        <p className="text-gray-400 text-sm">
          Crea el primer producto usando el botón "Nuevo Producto"
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / size)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                        aria-hidden="true"
                      />
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {formatPrice(product.price, product.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categoryNames[product.categoryId] ?? '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StockDisplay product={product} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.isAvailable ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                    aria-label={`Editar ${product.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    aria-label={`Eliminar ${product.name}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
