/* ============================================================
   FoodStore Brand Configuration (Mesa Design System)
   Single source of truth — never hardcode brand values.
   ============================================================ */

export const CONFIG = {
  // Brand
  brand: 'FoodStore',
  brandTagline: 'La cocina de Mendoza, en tu mesa.',
  logoChar: '·',

  // Locale & currency
  locale: 'es-AR',
  currency: '$',
  currencyCode: 'ARS',

  // Delivery
  deliveryFee: 450,
  freeDeliveryAt: 5000,
  deliveryLabel: 'Envío',

  // Colors — Mesa brand tokens
  brandColor: '#FF7A00',
  brandColorHover: '#FF8A1F',
  brandSoft: '#FFE9D5',
  brandInk: '#2D1804',

  // Feature flags
  features: {
    googleAuth: true,
    guestCheckout: false,
    tipping: true,
    searchPalette: true,
    dashboard: false,
  },

  // Payment methods shown in checkout
  paymentMethods: ['mercadopago', 'card', 'cash', 'transfer'] as const,

  // Tip percentages
  tipOptions: [0, 10, 15, 20] as const,
} as const

export type CONFIG = typeof CONFIG
