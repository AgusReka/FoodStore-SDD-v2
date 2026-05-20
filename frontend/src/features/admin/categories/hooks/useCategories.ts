import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { CategoryRaw, Category, CreateCategoryDto, UpdateCategoryDto } from '@entities/category'
import { normalizeCategory } from '@entities/category'
import { productsKeys } from '@features/admin/products/hooks/useProducts'

const STOCK_ALERTS_KEY = ['stock-alerts'] as const

// ── Query Keys ───────────────────────────────────────────────────────

export const categoriesKeys = {
  all: ['categories'] as const,
  list: (page: number, size: number, includeDeleted?: boolean) => ['categories', 'list', { page, size, includeDeleted }] as const,
  detail: (id: string) => ['categories', 'detail', id] as const,
}

/** Used by ProductForm to populate the category picker dropdown (has 5min staleTime). */
const CATEGORIES_ALL_KEY = ['categories', 'all'] as const

// ── List Hook ────────────────────────────────────────────────────────

export function useCategoriesList(page = 1, size = 20, includeDeleted?: boolean) {
  return useQuery({
    queryKey: categoriesKeys.list(page, size, includeDeleted),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, size }
      if (includeDeleted) params.include_deleted = true
      const response = await get<PaginatedResponse<CategoryRaw>>(
        ENDPOINTS.CATEGORIES_LIST,
        params
      )
      return {
        items: response.data.items.map(normalizeCategory),
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
      }
    },
    placeholderData: (prev) => prev,
  })
}

// ── Detail Hook ──────────────────────────────────────────────────────

export function useCategoryDetail(id: string | null) {
  return useQuery({
    queryKey: categoriesKeys.detail(id ?? ''),
    queryFn: async () => {
      const response = await get<CategoryRaw>(ENDPOINTS.CATEGORIES_DETAIL(id!))
      return normalizeCategory(response.data)
    },
    enabled: !!id,
  })
}

// ── Create Mutation ──────────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation<Category, Error, CreateCategoryDto>({
    mutationFn: async (data) => {
      const response = await post<CategoryRaw>(ENDPOINTS.CATEGORIES_LIST, data)
      return normalizeCategory(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_ALL_KEY })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}

// ── Update Mutation ──────────────────────────────────────────────────

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation<Category, Error, { id: string; data: UpdateCategoryDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await patch<CategoryRaw>(ENDPOINTS.CATEGORIES_DETAIL(id), data)
      return normalizeCategory(response.data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_ALL_KEY })
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}

// ── Delete Mutation ──────────────────────────────────────────────────

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await del<void>(ENDPOINTS.CATEGORIES_DETAIL(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_ALL_KEY })
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['stock-alerts-count'] })
    },
  })
}
