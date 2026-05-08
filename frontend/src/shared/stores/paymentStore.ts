import { create } from 'zustand'

type PaymentMethod = '' | 'efectivo' | 'transferencia' | 'mercadopago'
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error'

interface PaymentState {
  method: PaymentMethod
  processing: boolean
  status: PaymentStatus
  errorMessage: string | null

  setMethod: (method: PaymentMethod) => void
  startProcessing: () => void
  setSuccess: () => void
  setError: (message: string) => void
  reset: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  method: '',
  processing: false,
  status: 'idle',
  errorMessage: null,

  setMethod: (method) => set({ method }),

  startProcessing: () =>
    set({ processing: true, status: 'processing', errorMessage: null }),

  setSuccess: () =>
    set({ processing: false, status: 'success' }),

  setError: (message) =>
    set({ processing: false, status: 'error', errorMessage: message }),

  reset: () =>
    set({
      method: '',
      processing: false,
      status: 'idle',
      errorMessage: null,
    }),
}))
