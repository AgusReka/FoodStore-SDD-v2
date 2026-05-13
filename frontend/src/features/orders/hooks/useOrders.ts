import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
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

export function useOrdersList(page = 1, size = 20, estado?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.orders.list(), { page, size, estado }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size }
      if (estado) params.estado = estado

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
