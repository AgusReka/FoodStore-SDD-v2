export const queryKeys = {
  products: {
    list: () => ['products', 'list'] as const,
    detail: (id: string | number) => ['products', 'detail', id] as const,
  },
  categories: {
    list: () => ['categories', 'list'] as const,
    detail: (id: string | number) => ['categories', 'detail', id] as const,
  },
  orders: {
    list: () => ['orders', 'list'] as const,
    detail: (id: string | number) => ['orders', 'detail', id] as const,
    history: (id: string | number) => ['orders', 'detail', id, 'history'] as const,
  },
  users: {
    profile: () => ['users', 'profile'] as const,
  },
  admin: {
    ordersList: (filters?: Record<string, unknown>) => ['admin', 'orders', 'list', filters] as const,
    orderDetail: (id: string | number) => ['admin', 'orders', 'detail', id] as const,
    orderHistory: (id: string | number) => ['admin', 'orders', 'detail', id, 'history'] as const,
    dashboard: () => ['admin', 'dashboard'] as const,
  },
} as const
