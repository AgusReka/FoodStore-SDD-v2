import { Skeleton } from '@shared/components/Skeleton'
import type { DashboardMetrics } from '../hooks/useDashboardMetrics'

interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  bgColor: string
  trend?: { direction: 'up' | 'down'; value: string } | null
}

function KpiCard({ label, value, icon, bgColor, trend }: KpiCardProps) {
  return (
    <div className={`rounded-xl p-5 ${bgColor} border border-gray-200/50`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              {trend.value} vs ayer
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-white/60 backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-gray-200/50 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

interface DashboardKpiCardsProps {
  metrics: DashboardMetrics
}

export function DashboardKpiCards({ metrics }: DashboardKpiCardsProps) {
  if (metrics.error) {
    return (
      <div className="col-span-full rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-600 text-sm">Error al cargar métricas del dashboard</p>
        <button
          onClick={metrics.refresh}
          className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (metrics.loading) {
    return (
      <>
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </>
    )
  }

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-AR')}`

  const formatNumber = (n: number) => n.toLocaleString('es-AR')

  return (
    <>
      <KpiCard
        label="Órdenes Hoy"
        value={formatNumber(metrics.totalOrdersToday)}
        icon={
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
        bgColor="bg-blue-50"
      />
      <KpiCard
        label="Órdenes Pendientes"
        value={formatNumber(metrics.pendingOrders)}
        icon={
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        bgColor="bg-amber-50"
      />
      <KpiCard
        label="Ingresos Hoy"
        value={formatCurrency(metrics.revenueToday)}
        icon={
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        bgColor="bg-green-50"
      />
      <KpiCard
        label="Productos Vendidos Hoy"
        value={formatNumber(metrics.itemsSoldToday)}
        icon={
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
        bgColor="bg-purple-50"
      />
    </>
  )
}
