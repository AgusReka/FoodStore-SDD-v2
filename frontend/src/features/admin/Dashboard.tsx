import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { DashboardKpiCards } from './components/DashboardKpiCards'
import { DashboardCharts } from './components/DashboardCharts'
import { DashboardRecentOrders } from './components/DashboardRecentOrders'

export function Dashboard() {
  const metrics = useDashboardMetrics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de métricas y actividad del negocio
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCards metrics={metrics} />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Orders */}
      <DashboardRecentOrders />
    </div>
  )
}
