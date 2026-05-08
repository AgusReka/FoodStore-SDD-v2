import { create } from 'zustand'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItem: (productId: string) => CartItem | undefined
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      let newItems: CartItem[]

      if (existing) {
        newItems = state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      } else {
        newItems = [...state.items, { ...item, quantity }]
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }
    })
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.productId !== productId)
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }
    })
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.productId !== productId)
        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
        }
      }

      const newItems = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      }
    })
  },

  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),

  getItem: (productId) => get().items.find((i) => i.productId === productId),
}))
