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
  },
  users: {
    profile: () => ['users', 'profile'] as const,
  },
} as const
