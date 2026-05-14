import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { queryKeys } from '@shared/api/queryKeys'
import { Skeleton } from '@shared/components/Skeleton'
import { STATUS_LABELS, type OrderStatus } from '@shared/constants/orderStatus'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import type { PaginatedResponse } from '@shared/api/client'

interface OrderRead {
  id: string
  status: string
  total: number
  items: { product_id: string; quantity: number; subtotal: number }[]
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#F59E0B',
  confirmado: '#3B82F6',
  preparando: '#8B5CF6',
  enviado: '#06B6D4',
  entregado: '#10B981',
  cancelado: '#EF4444',
}

function OrdersByStatusChart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.admin.dashboard(), 'status-distribution'],
    queryFn: async () => {
      const res = await get<PaginatedResponse<OrderRead>>(
        ENDPOINTS.ADMIN_ORDERS_LIST,
        { page: 1, size: 100 }
      )
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Pedidos por Estado</h3>
        <div className="text-center py-8">
          <p className="text-sm text-red-500">Error al cargar</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-blue-600 underline">Reintentar</button>
        </div>
      </div>
    )
  }

  const orders = data?.items ?? []
  const statusCounts: Record<string, number> = {}
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status as OrderStatus] ?? status,
    value: count,
    color: STATUS_COLORS[status] ?? '#9CA3AF',
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Pedidos por Estado</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-400">No hay pedidos registrados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Pedidos por Estado</h3>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TopProductsChart() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.admin.dashboard(), 'top-products'],
    queryFn: async () => {
      // Fetch recent orders with items to aggregate top products
      const res = await get<PaginatedResponse<OrderRead>>(
        ENDPOINTS.ADMIN_ORDERS_LIST,
        { page: 1, size: 100 }
      )
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Productos Más Vendidos</h3>
        <div className="text-center py-8">
          <p className="text-sm text-red-500">Error al cargar</p>
          <button onClick={() => refetch()} className="mt-2 text-sm text-blue-600 underline">Reintentar</button>
        </div>
      </div>
    )
  }

  // Aggregate products sold across all fetched orders
  const productQuantities: Record<string, number> = {}
  ;(data?.items ?? [])
    .filter((o) => o.status !== 'cancelado' && o.status !== 'pendiente')
    .forEach((o) => {
      o.items.forEach((item) => {
        const key = item.product_id
        productQuantities[key] = (productQuantities[key] || 0) + item.quantity
      })
    })

  const sorted = Object.entries(productQuantities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Productos Más Vendidos</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-400">No hay productos vendidos aún</p>
        </div>
      </div>
    )
  }

  const chartData = sorted.map(([productId, quantity]) => ({
    name: productId.slice(0, 8) + '…',
    fullName: productId,
    quantity,
    fill: '#F97316',
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Productos Más Vendidos</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value) => [`${value} unidades`, 'Vendidos']}
          />
          <Bar dataKey="quantity" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrdersByStatusChart />
      <TopProductsChart />
    </div>
  )
}
