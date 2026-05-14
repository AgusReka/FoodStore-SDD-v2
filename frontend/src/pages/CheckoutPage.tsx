import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useCartStore } from '@shared/stores/cartStore'
import { usePaymentStore } from '@shared/stores/paymentStore'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { get, post } from '@shared/api/client'
import type { PaginatedResponse } from '@shared/api/client'
import { ENDPOINTS, CHECKOUT_MP_INIT } from '@shared/api/endpoints'
import { CONFIG } from '@shared/config/brand'
import { TipSelector } from '@widgets/TipSelector'
import { ShippingBar } from '@widgets/ShippingBar'
import { AddressCard } from '@entities/address/AddressCard'
import { AddressForm } from '@entities/address/AddressForm'

/* ============================================================
   Types
   ============================================================ */
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

type PaymentMethod = 'efectivo' | 'transferencia' | 'mercadopago'

type Step = 'entrega' | 'pago' | 'resumen'

/* ============================================================
   Payment method config
   ============================================================ */
const PAYMENT_METHODS: { value: PaymentMethod; label: string; desc: string }[] = [
  { value: 'efectivo', label: 'Efectivo', desc: 'Pagás al recibir el pedido' },
  { value: 'transferencia', label: 'Transferencia', desc: 'Transferencia bancaria' },
  { value: 'mercadopago', label: 'Mercado Pago', desc: 'Pagá con tarjeta, débito o Mercado Pago' },
]

/* ============================================================
   CheckoutPage — Mesa 3-step checkout
   Desktop: 2-col (form left + sticky summary 360px)
   Mobile: collapsible accordion steps
   ============================================================ */
const CheckoutPage = () => {
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
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
  const [currentStep, setCurrentStep] = useState<Step>('entrega')
  const [tip, setTip] = useState(10)
  const [isMpRedirecting, setIsMpRedirecting] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'creating' | 'redirecting' | 'done'>('idle')

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/', { replace: true })
    }
  }, [items, navigate])

  // Reset payment state on mount
  useEffect(() => {
    resetPayment()
  }, [resetPayment])

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

  // Pre-select primary address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const primary = addresses.find((a) => a.is_primary)
      setSelectedAddressId(primary?.id ?? addresses[0].id)
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
        amount: grandTotal,
      })
      return response.data
    },
  })

  const isProcessing = orderMutation.isPending || paymentMutation.isPending || isMpRedirecting

  // Calculate fees
  const deliveryFee = total >= CONFIG.freeDeliveryAt ? 0 : CONFIG.deliveryFee
  const tipAmount = Math.round(total * (tip / 100))
  const grandTotal = total + deliveryFee + tipAmount

  const formatPrice = (n: number) =>
    `$${n.toLocaleString(CONFIG.locale, { minimumFractionDigits: 2 })}`

  // Validation per step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'entrega':
        return !!selectedAddressId
      case 'pago':
        return !!paymentMethod
      case 'resumen':
        return true
    }
  }, [currentStep, selectedAddressId, paymentMethod])

  const handleNext = useCallback(() => {
    if (currentStep === 'entrega' && selectedAddressId) {
      setCurrentStep('pago')
    } else if (currentStep === 'pago' && paymentMethod) {
      setCurrentStep('resumen')
    }
  }, [currentStep, selectedAddressId, paymentMethod])

  const handleBack = useCallback(() => {
    if (currentStep === 'pago') setCurrentStep('entrega')
    else if (currentStep === 'resumen') setCurrentStep('pago')
  }, [currentStep])

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

    if (paymentMethod === 'mercadopago') {
      // MP flow: create Order + Payment immediately via mp-init, then redirect
      setIsMpRedirecting(true)
      setPaymentStep('redirecting')
      try {
        const itemsPayload = items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        }))
        const response = await post<{ init_point: string }>(
          CHECKOUT_MP_INIT,
          {
            items: itemsPayload,
            direccion_id: selectedAddressId,
          }
        )
        const { init_point } = response.data
        // No limpiamos el carrito acá — si el usuario vuelve sin pagar
        // (mp-return/failure) queremos que el carrito siga intacto.
        // El carrito se limpia al llegar a la página de detalle de orden
        // cuando el pago fue exitoso.
        // Solo reseteamos el estado de pago.
        resetPayment()
        window.location.href = init_point
        return
      } catch {
        setIsMpRedirecting(false)
        setPaymentStep('idle')
        setOrderError('Error al iniciar el pago con Mercado Pago. Intentá de nuevo más tarde.')
        return
      }
    }

    // Direct payment methods (efectivo / transferencia): create order + payment
    setPaymentStep('creating')
    try {
      const order = await orderMutation.mutateAsync()
      await paymentMutation.mutateAsync({ pedido_id: order.id })
      clearCart()
      resetPayment()
      navigate(`/orders/${order.id}?new=true`, { replace: true })
    } catch (err) {
      setPaymentStep('idle')
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

  const handleAddressCreated = useCallback(
    (address: Address) => {
      setShowAddressForm(false)
      setSelectedAddressId(address.id)
      refetchAddresses()
    },
    [refetchAddresses]
  )

  /* ============================================================
     Mercado Pago — redirecting state
     ============================================================ */
  const mpRedirectingSection = paymentStep === 'redirecting' && (
    <div
      style={{
        maxWidth: 400,
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
        animation: 'float-up 320ms var(--ease-out)',
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--line)',
          borderTopColor: 'var(--brand)',
          margin: '0 auto 24px',
        }}
      />
      <h3
        className="t-h3"
        style={{ fontSize: 18, marginBottom: 8 }}
      >
        Redirigiendo a Mercado Pago…
      </h3>
      <p className="t-caption">
        Estás siendo redirigido al entorno seguro de pago.
      </p>
    </div>
  )

  if (items.length === 0) return null

  /* ============================================================
     Step Indicator
     ============================================================ */
  const steps: { key: Step; label: string }[] = [
    { key: 'entrega', label: 'Entrega' },
    { key: 'pago', label: 'Pago' },
    { key: 'resumen', label: 'Resumen' },
  ]

  const stepIndicator = (
    <div
      style={{
        display: 'flex',
        gap: 0,
        marginBottom: 32,
        background: 'var(--surface)',
        borderRadius: 999,
        padding: 4,
      }}
    >
      {steps.map((s, i) => {
        const isActive = s.key === currentStep
        const isComplete = steps.findIndex((st) => st.key === currentStep) > i
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              // Allow navigating back to completed steps only
              const currentIdx = steps.findIndex((st) => st.key === currentStep)
              const targetIdx = steps.findIndex((st) => st.key === s.key)
              if (targetIdx < currentIdx) setCurrentStep(s.key)
            }}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'inherit',
              cursor: isComplete || isActive ? 'pointer' : 'default',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
          >
            {i + 1}. {s.label}
          </button>
        )
      })}
    </div>
  )

  /* ============================================================
     Step 1: Entrega
     ============================================================ */
  const stepEntrega = (
    <div className="space-y-5">
      <div>
        <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 4 }}>Dirección de entrega</h3>
        <p className="t-caption">¿Dónde querés recibir tu pedido?</p>
      </div>

      {addressesLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div
            className="animate-spin"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2.5px solid var(--line)',
              borderTopColor: 'var(--brand)',
            }}
          />
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
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--r-md)',
              border: '2px dashed var(--line-strong)',
              background: 'transparent',
              color: 'var(--ink-3)',
              fontSize: 13.5,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand)'
              e.currentTarget.style.color = 'var(--brand)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--line-strong)'
              e.currentTarget.style.color = 'var(--ink-3)'
            }}
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
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'var(--ink-3)', marginBottom: 16, fontSize: 14 }}>
            No tenés direcciones guardadas
          </p>
          <button
            type="button"
            onClick={() => setShowAddressForm(true)}
            className="btn btn-primary"
          >
            Agregar dirección
          </button>
        </div>
      )}

      {/* Delivery info callout */}
      <div
        style={{
          background: 'var(--brand-soft)',
          borderRadius: 'var(--r-sm)',
          padding: '12px 16px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>🚚</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 2 }}>
            Delivery estimado: 30-45 min
          </p>
          <p className="t-caption" style={{ color: 'var(--brand-ink)', opacity: 0.7 }}>
            Tiempo promedio desde que confirmás el pedido
          </p>
        </div>
      </div>
    </div>
  )

  /* ============================================================
     Step 2: Pago
     ============================================================ */
  const stepPago = (
    <div className="space-y-6">
      <div>
        <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 4 }}>Método de pago</h3>
        <p className="t-caption">Elegí cómo querés pagar</p>
      </div>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 'var(--r-md)',
              border: `2px solid ${paymentMethod === method.value ? 'var(--brand)' : 'var(--line)'}`,
              background: paymentMethod === method.value ? 'var(--brand-soft)' : 'var(--bg-elevated)',
              cursor: 'pointer',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${paymentMethod === method.value ? 'var(--brand)' : 'var(--ink-3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'border-color var(--d-fast) var(--ease-out)',
              }}
            >
              {paymentMethod === method.value && (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--brand)',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>
                {method.label}
              </p>
              <p className="t-caption">{method.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Tip */}
      <TipSelector tip={tip} onTipChange={setTip} />
    </div>
  )

  /* ============================================================
     Step 3: Resumen
     ============================================================ */
  const stepResumen = (
    <div className="space-y-6">
      <div>
        <h3 className="t-h3" style={{ fontSize: 18, marginBottom: 4 }}>Resumen del pedido</h3>
        <p className="t-caption">Revisá todo antes de confirmar</p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </p>
              <p className="t-caption">
                {formatPrice(item.price)} c/u × {item.quantity}
              </p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Delivery address summary */}
      {selectedAddressId && (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
          }}
        >
          <p className="t-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>ENTREGAR EN</p>
          <p style={{ fontSize: 14, color: 'var(--ink-1)', fontWeight: 500 }}>
            {addresses.find((a) => a.id === selectedAddressId)?.street ?? 'Dirección seleccionada'}
          </p>
        </div>
      )}

      {/* Payment summary */}
      {paymentMethod && (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
          }}
        >
          <p className="t-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>PAGO</p>
          <p style={{ fontSize: 14, color: 'var(--ink-1)', fontWeight: 500 }}>
            {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? paymentMethod}
          </p>
        </div>
      )}
    </div>
  )

  /* ============================================================
     Summary sidebar (desktop) / bottom sheet (mobile)
     ============================================================ */
  const summaryPanel = (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--line)',
        padding: 24,
      }}
    >
      <h3
        className="t-h3"
        style={{ fontSize: 16, marginBottom: 20 }}
      >
        Total del pedido
      </h3>

      <div className="space-y-3">
        <FeeRow label={`Productos (${items.length})`} value={formatPrice(total)} />
        <FeeRow
          label="Envío"
          value={deliveryFee === 0 ? 'Gratis' : formatPrice(deliveryFee)}
          valueColor={deliveryFee === 0 ? 'var(--success)' : undefined}
        />
        {tip > 0 && (
          <FeeRow label={`Propina (${tip}%)`} value={formatPrice(tipAmount)} />
        )}
        <div style={{ height: 1, background: 'var(--line-strong)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      {total < CONFIG.freeDeliveryAt && (
        <div style={{ marginTop: 16 }}>
          <ShippingBar />
        </div>
      )}

      {/* Errors */}
      {orderError && (
        <div
          style={{
            marginTop: 16,
            background: 'rgba(230,57,70,0.08)',
            border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--danger)',
          }}
        >
          {orderError}
        </div>
      )}
      {stockErrors.length > 0 && (
        <div style={{ marginTop: 12 }} className="space-y-2">
          {stockErrors.map((err, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(230,57,70,0.08)',
                border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--danger)',
              }}
            >
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Confirm button (only on summary step for desktop, always visible on mobile bottom) */}
      {currentStep === 'resumen' && (
        <button
          onClick={handleConfirmOrder}
          disabled={isProcessing}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '14px 24px',
            borderRadius: 999,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            background: isProcessing ? 'var(--line)' : 'var(--brand)',
            color: isProcessing ? 'var(--ink-3)' : 'white',
            boxShadow: isProcessing ? 'none' : 'var(--shadow-brand)',
            transition: 'all var(--d-fast) var(--ease-out)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block' }} />
              Procesando…
            </>
          ) : orderError || stockErrors.length > 0 ? (
            'Reintentar'
          ) : (
            `Confirmar pedido · ${formatPrice(grandTotal)}`
          )}
        </button>
      )}
    </div>
  )

  /* ============================================================
     Navigation buttons
     ============================================================ */
  const navButtons = (
    <div
      style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        marginTop: 24,
      }}
    >
      {currentStep !== 'entrega' ? (
        <button
          type="button"
          onClick={handleBack}
          style={{
            padding: '12px 24px',
            borderRadius: 999,
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--ink-2)',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all var(--d-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          ← Volver
        </button>
      ) : <div />}

      {currentStep !== 'resumen' && (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            padding: '12px 28px',
            borderRadius: 999,
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? 'var(--brand)' : 'var(--line)',
            color: canProceed ? 'white' : 'var(--ink-3)',
            boxShadow: canProceed ? 'var(--shadow-brand)' : 'none',
            transition: 'all var(--d-fast) var(--ease-out)',
          }}
        >
          Continuar
        </button>
      )}
    </div>
  )

  /* ---- DESKTOP: 2-column layout ---- */
  if (!isMobile) {
    // MP redirect replaces the layout entirely
    if (paymentStep === 'redirecting') {
      return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 28px 64px' }}>
          {mpRedirectingSection}
        </div>
      )
    }

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 64px' }}>
        {stepIndicator}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 40,
            alignItems: 'start',
          }}
        >
          {/* Left: Form */}
          <div>
            {/* Step content */}
            <div
              style={{
                animation: 'float-up 320ms var(--ease-out)',
              }}
            >
              {currentStep === 'entrega' && stepEntrega}
              {currentStep === 'pago' && stepPago}
              {currentStep === 'resumen' && stepResumen}
            </div>

            {navButtons}
          </div>

          {/* Right: Sticky summary */}
          <div style={{ position: 'sticky', top: 96 }}>
            {summaryPanel}
          </div>
        </div>
      </div>
    )
  }

  /* ---- MOBILE: accordion-style ---- */
  // MP redirect replaces the normal flow
  if (paymentStep === 'redirecting') {
    return (
      <div style={{ padding: '24px 16px 64px' }}>
        {mpRedirectingSection}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px 32px' }}>
      {stepIndicator}

      {/* Always show all steps as collapsible sections */}
      <div className="space-y-4">
        {/* Step 1: Entrega */}
        <StepSection
          number={1}
          title="Entrega"
          isOpen={true}
          completed={currentStep !== 'entrega'}
        >
          {stepEntrega}
        </StepSection>

        {/* Step 2: Pago */}
        <StepSection
          number={2}
          title="Pago"
          isOpen={currentStep === 'pago'}
          completed={steps.findIndex((s) => s.key === currentStep) >= 1}
        >
          {stepPago}
        </StepSection>

        {/* Step 3: Resumen */}
        <StepSection
          number={3}
          title="Resumen"
          isOpen={currentStep === 'resumen'}
          completed={steps.findIndex((s) => s.key === currentStep) >= 2}
        >
          {stepResumen}
        </StepSection>
      </div>

      {navButtons}

      {/* Fixed bottom summary + confirm */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--line)',
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 20px rgba(20,16,12,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Total</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-1)' }}>
            {formatPrice(grandTotal)}
          </span>
        </div>

        {currentStep === 'resumen' ? (
          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 999,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              background: isProcessing ? 'var(--line)' : 'var(--brand)',
              color: isProcessing ? 'var(--ink-3)' : 'white',
              boxShadow: isProcessing ? 'none' : 'var(--shadow-brand)',
            }}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', marginRight: 8 }} />
                Procesando…
              </>
            ) : `Confirmar pedido · ${formatPrice(grandTotal)}`}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 999,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              background: canProceed ? 'var(--brand)' : 'var(--line)',
              color: canProceed ? 'white' : 'var(--ink-3)',
              boxShadow: canProceed ? 'var(--shadow-brand)' : 'none',
            }}
          >
            Continuar
          </button>
        )}
      </div>

      {/* Spacer for fixed footer */}
      <div style={{ height: 120 }} />
    </div>
  )
}

/* ============================================================
   StepSection — Collapsible section for mobile accordion
   ============================================================ */
function StepSection({
  number,
  title,
  isOpen,
  completed,
  children,
}: {
  number: number
  title: string
  isOpen: boolean
  completed: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--r-lg)',
        border: `1px solid ${isOpen ? 'var(--brand-soft)' : 'var(--line)'}`,
        overflow: 'hidden',
        transition: 'border-color var(--d-fast) var(--ease-out)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          background: completed && !isOpen ? 'var(--brand-soft)' : 'transparent',
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--ff-body)',
            background: completed ? 'var(--success)' : isOpen ? 'var(--brand)' : 'var(--line)',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {completed ? '✓' : number}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>
          {title}
        </span>
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   FeeRow — Label + value line
   ============================================================ */
function FeeRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: valueColor ?? 'var(--ink-1)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default CheckoutPage
