import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { queryKeys } from '@shared/api/queryKeys'
import type { PaginatedResponse } from '@shared/api/client'

export interface OrderItemRead {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface PaymentRead {
  id: string
  order_id: string
  payment_method: string
  status: string
  amount: number
  currency: string
  mp_payment_id: string | null
  created_at: string
  updated_at: string | null
}

export interface OrderHistoryEntry {
  id: string
  from_status: string
  to_status: string
  changed_by: string | null
  reason: string | null
  created_at: string
}

export interface OrderRead {
  id: string
  user_id: string
  address_id: string | null
  status: string
  total: number
  currency: string
  items: OrderItemRead[]
  payment?: PaymentRead | null
  created_at: string
  updated_at: string | null
}

export interface OrderAdminFilters {
  page: number
  size: number
  estado?: string | null
  desde?: string | null
  hasta?: string | null
  search?: string | null
}

interface UpdateStatusPayload {
  status: string
  reason?: string
}

export function useAdminOrdersList(filters: OrderAdminFilters) {
  return useQuery({
    queryKey: queryKeys.admin.ordersList(filters as unknown as Record<string, unknown>),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page,
        size: filters.size,
      }
      if (filters.estado) params.estado = filters.estado
      if (filters.desde) params.desde = filters.desde
      if (filters.hasta) params.hasta = filters.hasta

      const res = await get<PaginatedResponse<OrderRead>>(
        ENDPOINTS.ADMIN_ORDERS_LIST,
        params
      )
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useAdminOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orderDetail(orderId!),
    queryFn: async () => {
      const res = await get<OrderRead>(ENDPOINTS.ORDERS_DETAIL(orderId!))
      return res.data
    },
    enabled: !!orderId,
  })
}

export function useAdminOrderHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orderHistory(orderId!),
    queryFn: async () => {
      const res = await get<OrderHistoryEntry[]>(ENDPOINTS.ORDERS_HISTORY(orderId!))
      return res.data
    },
    enabled: !!orderId,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string
      data: UpdateStatusPayload
    }) => {
      const res = await patch<OrderRead>(ENDPOINTS.ORDERS_UPDATE_STATUS(orderId), data)
      return res.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the order detail and the admin list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orderDetail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}
