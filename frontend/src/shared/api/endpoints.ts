// API endpoint path constants for FoodStore
// Base prefix: /api/v1 (defined in axios.ts baseURL or constants)

const AUTH = '/auth'
const USERS = '/usuarios'
const PRODUCTS = '/productos'
const CATEGORIES = '/categorias'
const INGREDIENTS = '/ingredientes'
const ORDERS = '/pedidos'
const PAYMENTS = '/pagos'
const ADDRESSES = '/direcciones'
const ADMIN = '/admin'
const HEALTH = '/health'

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: `${AUTH}/register`,
  AUTH_LOGIN: `${AUTH}/login`,
  AUTH_ME: `${AUTH}/me`,
  AUTH_REFRESH: `${AUTH}/refresh`,
  AUTH_LOGOUT: `${AUTH}/logout`,
  AUTH_FORGOT_PASSWORD: `${AUTH}/forgot-password`,
  AUTH_RESET_PASSWORD: `${AUTH}/reset-password`,
  AUTH_SEND_VERIFICATION: `${AUTH}/send-verification`,
  AUTH_VERIFY_EMAIL: `${AUTH}/verify-email`,
  AUTH_CHANGE_PASSWORD: `${AUTH}/change-password`,

  // Users
  USERS_LIST: `${USERS}/`,
  USERS_DETAIL: (id: string | number) => `${USERS}/${id}`,

  // Products
  PRODUCTS_LIST: `${PRODUCTS}/`,
  PRODUCTS_DETAIL: (id: string | number) => `${PRODUCTS}/${id}`,
  PRODUCTS_POPULAR: `${PRODUCTS}/popular`,
  PRODUCTS_STOCK: (id: string | number) => `${PRODUCTS}/${id}/stock`,

  // Categories
  CATEGORIES_LIST: `${CATEGORIES}/`,
  CATEGORIES_DETAIL: (id: string | number) => `${CATEGORIES}/${id}`,

  // Ingredients
  INGREDIENTS_LIST: `${INGREDIENTS}/`,
  INGREDIENTS_DETAIL: (id: string | number) => `${INGREDIENTS}/${id}`,

  // Orders
  ORDERS_LIST: `${ORDERS}/`,
  ORDERS_DETAIL: (id: string | number) => `${ORDERS}/${id}`,
  ORDERS_CREATE: `${ORDERS}/`,
  ORDERS_UPDATE_STATUS: (id: string | number) => `${ORDERS}/${id}/status`,
  ORDERS_HISTORY: (id: string | number) => `${ORDERS}/${id}/history`,

  // Payments
  PAYMENTS_CREATE: `${PAYMENTS}/`,
  PAYMENTS_DETAIL: (id: string | number) => `${PAYMENTS}/${id}`,
  PAYMENTS_UPDATE_STATUS: (id: string | number) => `${PAYMENTS}/${id}/status`,

  // Addresses
  ADDRESSES_LIST: `${ADDRESSES}/`,
  ADDRESSES_CREATE: `${ADDRESSES}/`,
  ADDRESSES_UPDATE: (id: string | number) => `${ADDRESSES}/${id}`,
  ADDRESSES_DELETE: (id: string | number) => `${ADDRESSES}/${id}`,

  // Admin
  ADMIN_USERS_LIST: `${ADMIN}/usuarios`,
  ADMIN_USERS_ROLE: (id: string | number) => `${ADMIN}/usuarios/${id}/role`,
  ADMIN_ORDERS_LIST: `${ADMIN}/pedidos`,
  ADMIN_STOCK_ALERTS: `${ADMIN}/stock-alerts`,

  // Health
  HEALTH_CHECK: `${HEALTH}`,
  HEALTH_READY: `${HEALTH}/ready`,
  HEALTH_LIVE: `${HEALTH}/live`,
} as const
