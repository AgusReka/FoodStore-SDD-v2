import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { queryKeys } from '@shared/api/queryKeys'
import type { PaginatedResponse } from '@shared/api/client'

export interface OrderItemRead {
  id: string
  product_id: string
  product_name: string
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
  mp_preference_id: string | null
  mp_init_point: string | null
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
  numero: number | null
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

export function useOrdersList(page = 1, size = 20, estado?: string | null, periodo: string = 'all') {
  return useQuery({
    queryKey: [...queryKeys.orders.list(), { page, size, estado, periodo }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size }
      if (estado) params.estado = estado
      if (periodo && periodo !== 'all') params.periodo = periodo

      const response = await get<PaginatedResponse<OrderRead>>(
        ENDPOINTS.ORDERS_LIST,
        params
      )
      return response.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId!),
    queryFn: async () => {
      const response = await get<OrderRead>(ENDPOINTS.ORDERS_DETAIL(orderId!))
      return response.data
    },
    enabled: !!orderId,
  })
}

export function useOrderHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.history(orderId!),
    queryFn: async () => {
      const response = await get<OrderHistoryEntry[]>(ENDPOINTS.ORDERS_HISTORY(orderId!))
      return response.data
    },
    enabled: !!orderId,
  })
}
