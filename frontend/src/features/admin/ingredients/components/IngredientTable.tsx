import type { Ingredient } from '@entities/ingredient'
import { Pagination } from '@shared/components/Pagination'
import { Skeleton } from '@shared/components/Skeleton'

interface IngredientTableProps {
  ingredients: Ingredient[]
  isLoading: boolean
  total: number
  page: number
  size: number
  onPageChange: (page: number) => void
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredient: Ingredient) => void
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
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

function StockBadge({ actual, minimo }: { actual: number; minimo: number }) {
  const suficiente = actual >= minimo
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        suficiente
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
      title={suficiente ? 'Stock suficiente' : `Stock bajo — mínimo: ${minimo}`}
    >
      {actual}
    </span>
  )
}

export function IngredientTable({
  ingredients,
  isLoading,
  total,
  page,
  size,
  onPageChange,
  onEdit,
  onDelete,
}: IngredientTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TableSkeleton />
      </div>
    )
  }

  if (ingredients.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No hay ingredientes</p>
        <p className="text-gray-400 text-sm">
          Crea el primer ingrediente usando el botón "Nuevo Ingrediente"
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
                Unidad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mínimo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id} className={`transition-colors ${ingredient.deletedAt ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ingredient.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ingredient.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {ingredient.deletedAt ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Eliminado
                    </span>
                  ) : (
                    <StockBadge actual={ingredient.stockActual} minimo={ingredient.stockMinimo} />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ingredient.stockMinimo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {ingredient.description ?? '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {!ingredient.deletedAt && (
                    <>
                      <button
                        onClick={() => onEdit(ingredient)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                        aria-label={`Editar ${ingredient.name}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(ingredient)}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        aria-label={`Eliminar ${ingredient.name}`}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
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
