import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface UiState {
  sidebarOpen: boolean
  cartOpen: boolean
  searchOpen: boolean
  selectedProductId: string | null
  modals: string[]
  toasts: Toast[]
  isLoading: boolean

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
  openModal: (id: string) => void
  closeModal: (id: string) => void
  openProductModal: (id: string) => void
  closeProductModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  setLoading: (loading: boolean) => void
}

let toastCounter = 0

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  searchOpen: false,
  selectedProductId: null,
  modals: [],
  toasts: [],
  isLoading: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),

  setCartOpen: (open) => set({ cartOpen: open }),

  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

  setSearchOpen: (open) => set({ searchOpen: open }),

  openModal: (id) =>
    set((state) => ({
      modals: state.modals.includes(id) ? state.modals : [...state.modals, id],
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m !== id),
    })),

  openProductModal: (id) => set({ selectedProductId: id }),

  closeProductModal: () => set({ selectedProductId: null }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${++toastCounter}` }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}))
