import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { ProductRaw } from '@entities/product'
import { normalizeProduct } from '@entities/product'
import { customerProductsKeys } from './useCustomerProducts'

export function useCustomerProductDetail(id: string | null) {
  return useQuery({
    queryKey: customerProductsKeys.detail(id ?? ''),
    queryFn: async () => {
      const response = await get<ProductRaw>(ENDPOINTS.PRODUCTS_DETAIL(id!))
      return normalizeProduct(response.data)
    },
    enabled: !!id,
  })
}
