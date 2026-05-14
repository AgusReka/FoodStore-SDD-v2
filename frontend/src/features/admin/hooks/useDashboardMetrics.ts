import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { queryKeys } from '@shared/api/queryKeys'
import type { PaginatedResponse } from '@shared/api/client'

interface OrderItemRead {
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderRead {
  id: string
  status: string
  total: number
  items: OrderItemRead[]
  created_at: string
  user_id: string
}

export interface DashboardMetrics {
  totalOrdersToday: number
  totalOrders: number
  pendingOrders: number
  revenueToday: number
  itemsSoldToday: number
  loading: boolean
  error: boolean
  refresh: () => void
}

function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return {
    desde: start.toISOString(),
    hasta: now.toISOString(),
  }
}

export function useDashboardMetrics(): DashboardMetrics {
  // Stabilize today range — only computed once per component mount
  const today = useMemo(() => getTodayRange(), [])

  const results = useQueries({
    queries: [
      {
        // Use a stable string key instead of the object reference
        queryKey: [...queryKeys.admin.dashboard(), 'orders-today', today.desde],
        queryFn: async () => {
          const res = await get<PaginatedResponse<OrderRead>>(
            ENDPOINTS.ADMIN_ORDERS_LIST,
            { desde: today.desde, hasta: today.hasta, page: 1, size: 100 }
          )
          return res.data
        },
        staleTime: 30_000, // 30s before refetching
      },
      {
        queryKey: [...queryKeys.admin.dashboard(), 'pending-count'],
        queryFn: async () => {
          const res = await get<PaginatedResponse<OrderRead>>(
            ENDPOINTS.ADMIN_ORDERS_LIST,
            { estado: 'pendiente', page: 1, size: 1 }
          )
          return res.data
        },
        staleTime: 30_000,
      },
      {
        queryKey: [...queryKeys.admin.dashboard(), 'total-count'],
        queryFn: async () => {
          const res = await get<PaginatedResponse<OrderRead>>(
            ENDPOINTS.ADMIN_ORDERS_LIST,
            { page: 1, size: 1 }
          )
          return res.data
        },
        staleTime: 30_000,
      },
    ],
  })

  const [ordersTodayQuery, pendingQuery, totalQuery] = results

  const ordersToday = ordersTodayQuery.data?.items ?? []
  const pendingTotal = pendingQuery.data?.total ?? 0
  const totalOrders = totalQuery.data?.total ?? 0

  const revenueToday = ordersToday
    .filter((o) => o.status === 'entregado')
    .reduce((sum, o) => sum + o.total, 0)

  const itemsSoldToday = ordersToday
    .filter((o) => o.status === 'entregado' || o.status === 'confirmado' || o.status === 'preparando' || o.status === 'enviado')
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)

  return {
    totalOrdersToday: ordersTodayQuery.data?.total ?? 0,
    totalOrders,
    pendingOrders: pendingTotal,
    revenueToday,
    itemsSoldToday,
    loading: results.some((q) => q.isLoading),
    error: results.some((q) => q.isError),
    refresh: () => results.forEach((q) => q.refetch()),
  }
}
