import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { ProductRaw, Product, CreateProductDto, UpdateProductDto } from '@entities/product'
import { normalizeProduct } from '@entities/product'

// ── Query Keys ───────────────────────────────────────────────────────

export const productsKeys = {
  all: ['products'] as const,
  list: (page: number, size: number, search?: string | null, categoriaId?: string | null, includeDeleted?: boolean) =>
    ['products', 'list', { page, size, search, categoriaId, includeDeleted }] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
}

const STOCK_ALERTS_KEY = ['stock-alerts'] as const

// ── List Hook ────────────────────────────────────────────────────────

export function useProductsList(
  page = 1,
  size = 20,
  search?: string | null,
  categoriaId?: string | null,
  includeDeleted?: boolean
) {
  return useQuery({
    queryKey: productsKeys.list(page, size, search, categoriaId, includeDeleted),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size }
      if (search) params.search = search
      if (categoriaId) params.categoria_id = categoriaId
      if (includeDeleted) params.include_deleted = true

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

// ── Detail Hook ──────────────────────────────────────────────────────

export function useProductDetail(id: string | null) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? ''),
    queryFn: async () => {
      const response = await get<ProductRaw>(ENDPOINTS.PRODUCTS_DETAIL(id!))
      return normalizeProduct(response.data)
    },
    enabled: !!id,
  })
}

// ── Create Mutation ──────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation<Product, Error, CreateProductDto>({
    mutationFn: async (data) => {
      const response = await post<ProductRaw>(ENDPOINTS.PRODUCTS_LIST, data)
      return normalizeProduct(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}

// ── Update Mutation ──────────────────────────────────────────────────

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation<Product, Error, { id: string; data: UpdateProductDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await patch<ProductRaw>(ENDPOINTS.PRODUCTS_DETAIL(id), data)
      return normalizeProduct(response.data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}

// ── Delete Mutation ──────────────────────────────────────────────────

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await del<void>(ENDPOINTS.PRODUCTS_DETAIL(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}
