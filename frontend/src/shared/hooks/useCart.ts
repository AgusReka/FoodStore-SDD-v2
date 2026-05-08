import { useMutation } from '@tanstack/react-query'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { post } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

interface CreateOrderItem {
  product_id: string
  quantity: number
}

interface CreateOrderData {
  items: CreateOrderItem[]
  address_id?: string
}

interface OrderItemRead {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface OrderRead {
  id: string
  user_id: string
  address_id?: string | null
  status: string
  total: number
  currency: string
  items: OrderItemRead[]
  created_at: string
  updated_at?: string | null
}

export function useCart() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const itemCount = useCartStore((s) => s.itemCount)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const getItem = useCartStore((s) => s.getItem)
  const isAuthenticated = useAuthStore((s) => !!s.accessToken)

  const orderMutation = useMutation<OrderRead, Error, { address_id?: string }>({
    mutationFn: async ({ address_id }) => {
      const orderItems: CreateOrderItem[] = items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }))

      const payload: CreateOrderData = {
        items: orderItems,
        ...(address_id ? { address_id } : {}),
      }

      const response = await post<OrderRead>(ENDPOINTS.ORDERS_CREATE, payload)
      return response.data
    },
    onSuccess: () => {
      clearCart()
    },
  })

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
    submitOrder: orderMutation.mutateAsync,
    submitOrderData: orderMutation.data,
    isSubmitting: orderMutation.isPending,
    submitError: orderMutation.error,
    canSubmit: isAuthenticated && items.length > 0,
  }
}
