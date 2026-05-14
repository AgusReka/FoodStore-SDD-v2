// Route path constants for the FoodStore frontend

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:orderId',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
} as const

// Dynamic route helpers
export const orderDetail = (orderId: string | number): string =>
  ROUTES.ORDER_DETAIL.replace(':orderId', String(orderId))

export const adminUserDetail = (userId: string | number): string =>
  `/admin/users/${userId}`

export const adminProductDetail = (productId: string | number): string =>
  `/admin/products/${productId}`
