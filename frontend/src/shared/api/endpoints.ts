// API endpoint path constants for FoodStore
// Base prefix: /api/v1 (defined in axios.ts baseURL or constants)

const AUTH = '/auth'
const USERS = '/usuarios'
const PRODUCTS = '/productos'
const CATEGORIES = '/categorias'
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

  // Users
  USERS_LIST: `${USERS}/`,
  USERS_DETAIL: (id: string | number) => `${USERS}/${id}`,

  // Products
  PRODUCTS_LIST: `${PRODUCTS}/`,
  PRODUCTS_DETAIL: (id: string | number) => `${PRODUCTS}/${id}`,

  // Categories
  CATEGORIES_LIST: `${CATEGORIES}/`,
  CATEGORIES_DETAIL: (id: string | number) => `${CATEGORIES}/${id}`,

  // Orders
  ORDERS_LIST: `${ORDERS}/`,
  ORDERS_DETAIL: (id: string | number) => `${ORDERS}/${id}`,
  ORDERS_CREATE: `${ORDERS}/`,
  ORDERS_UPDATE_STATUS: (id: string | number) => `${ORDERS}/${id}/status`,

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

  // Health
  HEALTH_CHECK: `${HEALTH}`,
  HEALTH_READY: `${HEALTH}/ready`,
  HEALTH_LIVE: `${HEALTH}/live`,
} as const
