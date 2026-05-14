import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { CategoryRaw } from '@entities/category'
import { normalizeCategory } from '@entities/category'

export const customerCategoriesKeys = {
  all: ['customer-categories'] as const,
  list: () => ['customer-categories', 'list'] as const,
}

export function useCustomerCategoriesList() {
  return useQuery({
    queryKey: customerCategoriesKeys.list(),
    queryFn: async () => {
      const response = await get<PaginatedResponse<CategoryRaw>>(
        ENDPOINTS.CATEGORIES_LIST,
        { page: 1, size: 100 }
      )
      return {
        items: response.data.items.map(normalizeCategory),
        total: response.data.total,
      }
    },
  })
}
