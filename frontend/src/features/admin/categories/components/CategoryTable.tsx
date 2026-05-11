import type { Category } from '@entities/category'
import { Pagination } from '@shared/components/Pagination'
import { Skeleton } from '@shared/components/Skeleton'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  total: number
  page: number
  size: number
  onPageChange: (page: number) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function CategoryTable({
  categories,
  isLoading,
  total,
  page,
  size,
  onPageChange,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TableSkeleton />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No hay categorías</p>
        <p className="text-gray-400 text-sm">
          Crea la primera categoría usando el botón "Nueva Categoría"
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
                Descripción
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
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {category.description ?? '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                    aria-label={`Editar ${category.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    aria-label={`Eliminar ${category.name}`}
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
