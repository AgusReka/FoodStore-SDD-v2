import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useCartStore } from '@shared/stores/cartStore'
import { usePaymentStore } from '@shared/stores/paymentStore'
import { get, post } from '@shared/api/client'
import type { PaginatedResponse } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { AddressCard } from '@entities/address/AddressCard'
import { AddressForm } from '@entities/address/AddressForm'

interface Address {
  id: string
  street: string
  city: string
  postal_code: string
  is_primary?: boolean
}

interface CreateOrderResponse {
  id: string
  status: string
  total: number
}

interface CreatePaymentResponse {
  id: string
  status: string
}

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'mercadopago', label: 'Mercado Pago', icon: '🟡' },
]

const CheckoutPage = () => {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const clearCart = useCartStore((s) => s.clearCart)
  const paymentMethod = usePaymentStore((s) => s.method)
  const setPaymentMethod = usePaymentStore((s) => s.setMethod)
  const resetPayment = usePaymentStore((s) => s.reset)

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [stockErrors, setStockErrors] = useState<string[]>([])

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items, navigate])

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await get<PaginatedResponse<Address>>(ENDPOINTS.ADDRESSES_LIST)
      return response.data.items
    },
    enabled: items.length > 0,
  })

  const addresses = addressesData ?? []

  // Pre-select principal address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const principal = addresses.find((a) => a.is_primary)
      setSelectedAddressId(principal?.id ?? addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  // Order mutation
  const orderMutation = useMutation<CreateOrderResponse, Error, void>({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }))
      const response = await post<CreateOrderResponse>(ENDPOINTS.ORDERS_CREATE, {
        items: orderItems,
        address_id: selectedAddressId,
      })
      return response.data
    },
  })

  // Payment mutation
  const paymentMutation = useMutation<CreatePaymentResponse, Error, { pedido_id: string }>({
    mutationFn: async ({ pedido_id }) => {
      const response = await post<CreatePaymentResponse>(ENDPOINTS.PAYMENTS_CREATE, {
        pedido_id,
        payment_method: paymentMethod,
        amount: total,
      })
      return response.data
    },
  })

  const isProcessing = orderMutation.isPending || paymentMutation.isPending

  const handleConfirmOrder = useCallback(async () => {
    if (!selectedAddressId) {
      setOrderError('Seleccioná una dirección de entrega')
      return
    }
    if (!paymentMethod) {
      setOrderError('Seleccioná un método de pago')
      return
    }

    setOrderError(null)
    setStockErrors([])

    try {
      // Step 1: Create order
      const order = await orderMutation.mutateAsync()

      // Step 2: Create payment
      await paymentMutation.mutateAsync({ pedido_id: order.id })

      // Step 3: Clear cart + reset payment state
      clearCart()
      resetPayment()

      // Step 4: Navigate to order confirmation
      navigate(`/orders/${order.id}?new=true`, { replace: true })
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes('stock') || msg.includes('disponible')) {
          setStockErrors(['Algunos productos no tienen stock suficiente. Revisá tu carrito e intentá de nuevo.'])
        } else {
          setOrderError(msg || 'Ocurrió un error al procesar tu pedido')
        }
      } else {
        setOrderError('Ocurrió un error al procesar tu pedido')
      }
    }
  }, [selectedAddressId, paymentMethod, orderMutation, paymentMutation, clearCart, resetPayment, navigate, total])

  const handleAddressCreated = useCallback((address: Address) => {
    setShowAddressForm(false)
    setSelectedAddressId(address.id)
    refetchAddresses()
  }, [refetchAddresses])

  if (items.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">🍽</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">× {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dirección de entrega</h2>

            {addressesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-[var(--brand)] border-t-transparent rounded-full" />
              </div>
            ) : addresses.length > 0 && !showAddressForm ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedAddressId === addr.id}
                    onSelect={setSelectedAddressId}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors text-sm font-medium"
                >
                  + Agregar otra dirección
                </button>
              </div>
            ) : showAddressForm ? (
              <AddressForm
                onSuccess={handleAddressCreated}
                onCancel={() => setShowAddressForm(false)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tenés direcciones guardadas</p>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
                >
                  Agregar dirección
                </button>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Método de pago</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.value
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-gray-900">{method.label}</span>
                  {paymentMethod === method.value && (
                    <span className="ml-auto text-[var(--brand)]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Summary + Confirm */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Total</h3>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Errors */}
              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {orderError}
                </div>
              )}
              {stockErrors.length > 0 && (
                <div className="space-y-2 mb-4">
                  {stockErrors.map((err, i) => (
                    <div key={i} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing || !selectedAddressId || !paymentMethod}
                className="w-full py-3 px-6 rounded-xl text-base font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </>
                ) : orderError || stockErrors.length > 0 ? (
                  'Reintentar'
                ) : (
                  'Confirmar pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
