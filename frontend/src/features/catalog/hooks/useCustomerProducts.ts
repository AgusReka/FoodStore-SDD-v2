import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { ProductRaw } from '@entities/product'
import { normalizeProduct } from '@entities/product'

export const customerProductsKeys = {
  all: ['customer-products'] as const,
  list: (page: number, size: number, search?: string | null, categoriaId?: string | null) =>
    ['customer-products', 'list', { page, size, search, categoriaId }] as const,
  detail: (id: string) => ['customer-products', 'detail', id] as const,
}

export function useCustomerProductsList(
  page = 1,
  size = 12,
  search?: string | null,
  categoriaId?: string | null
) {
  return useQuery({
    queryKey: customerProductsKeys.list(page, size, search, categoriaId),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size }
      if (search) params.search = search
      if (categoriaId) params.categoria_id = categoriaId

      const response = await get<PaginatedResponse<ProductRaw>>(
        ENDPOINTS.PRODUCTS_LIST,
        params
      )
      return {
        items: response.data.items.map(normalizeProduct),
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
      }
    },
    placeholderData: (prev) => prev,
  })
}
