import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { Button } from '@shared/components/Button'
import { useNavigate } from 'react-router-dom'

interface StockAlertItem {
  ingredient_id: string
  name: string
  unit: string
  stock_actual: number
  stock_minimo: number
  deficit: number
  severity: number
  products_affected: string[]
}

interface StockAlertList {
  items: StockAlertItem[]
  total: number
}

export function StockAlertsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<StockAlertList>({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      const response = await get<StockAlertList>(ENDPOINTS.ADMIN_STOCK_ALERTS)
      return response.data
    },
    refetchInterval: 30_000, // Refresh every 30 seconds
  })

  const alerts = data?.items ?? []

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alertas de Stock</h1>
            <p className="text-sm text-gray-500 mt-1">Verificando stock de ingredientes...</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas de Stock</h1>
          <p className="text-sm text-gray-500 mt-1">
            {alerts.length === 0
              ? 'Todos los ingredientes tienen stock suficiente'
              : `${alerts.length} ingrediente${alerts.length === 1 ? '' : 's'} por debajo del mínimo`
            }
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-gray-500 text-lg mb-2">Todos los ingredientes tienen stock suficiente</p>
          <p className="text-gray-400 text-sm">
            No hay alertas de stock en este momento
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingrediente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock actual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mínimo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déficit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos afectados
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr
                    key={alert.ingredient_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-red-600 font-medium">{alert.stock_actual}</span>
                      <span className="text-gray-400 ml-1">{alert.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.stock_minimo} {alert.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        -{alert.deficit.toFixed(2)} {alert.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {alert.products_affected.length > 0
                        ? alert.products_affected.join(', ')
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/admin/ingredients`)}
                      >
                        Reponer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
