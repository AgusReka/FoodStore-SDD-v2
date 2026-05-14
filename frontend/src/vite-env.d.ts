/// <reference types="vite/client" />

/* ── Mercado Pago SDK types ── */
interface MercadoPagoBrickCallbacks {
  onSubmit?: () => void
  onReady?: () => void
  onError?: (error: unknown) => void
}

interface MercadoPagoBrickInitialization {
  preferenceId: string
}

interface MercadoPagoBrickCustomization {
  texts?: {
    action?: 'pay' | 'buy'
    valueProp?: 'smart_option' | 'security' | 'installments' | 'convenience'
  }
}

interface MercadoPagoWalletBrickOptions {
  initialization: MercadoPagoBrickInitialization
  customization?: MercadoPagoBrickCustomization
  callbacks: MercadoPagoBrickCallbacks
}

declare class MercadoPago {
  constructor(publicKey: string, options?: Record<string, unknown>)
  bricks(): {
    create(
      brickType: 'wallet',
      containerId: string,
      options: MercadoPagoWalletBrickOptions
    ): Promise<void>
  }
}

interface Window {
  MercadoPago: typeof MercadoPago
}
