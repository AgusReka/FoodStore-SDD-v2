import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, del } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { IngredientRaw, Ingredient, CreateIngredientDto, UpdateIngredientDto } from '@entities/ingredient'
import { normalizeIngredient } from '@entities/ingredient'
import { productsKeys } from '@features/admin/products/hooks/useProducts'

// ── Query Keys ───────────────────────────────────────────────────────

export const ingredientsKeys = {
  all: ['ingredients'] as const,
  list: (page: number, size: number) => ['ingredients', 'list', { page, size }] as const,
  detail: (id: string) => ['ingredients', 'detail', id] as const,
}

// ── Cross-feature query keys (ad-hoc keys used elsewhere) ──────────

/** Used by ProductForm to populate the ingredient picker dropdown (has 5min staleTime). */
const INGREDIENTS_ALL_KEY = ['ingredients', 'all'] as const

/** Used by StockAlertsPage. */
const STOCK_ALERTS_KEY = ['stock-alerts'] as const

// ── List Hook ────────────────────────────────────────────────────────

export function useIngredientsList(page = 1, size = 20) {
  return useQuery({
    queryKey: ingredientsKeys.list(page, size),
    queryFn: async () => {
      const response = await get<PaginatedResponse<IngredientRaw>>(
        ENDPOINTS.INGREDIENTS_LIST,
        { page, size }
      )
      return {
        items: response.data.items.map(normalizeIngredient),
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
      }
    },
    placeholderData: (prev) => prev,
  })
}

// ── Detail Hook ──────────────────────────────────────────────────────

export function useIngredientDetail(id: string | null) {
  return useQuery({
    queryKey: ingredientsKeys.detail(id ?? ''),
    queryFn: async () => {
      const response = await get<IngredientRaw>(ENDPOINTS.INGREDIENTS_DETAIL(id!))
      return normalizeIngredient(response.data)
    },
    enabled: !!id,
  })
}

// ── Create Mutation ──────────────────────────────────────────────────

export function useCreateIngredient() {
  const queryClient = useQueryClient()

  return useMutation<Ingredient, Error, CreateIngredientDto>({
    mutationFn: async (data) => {
      const response = await post<IngredientRaw>(ENDPOINTS.INGREDIENTS_LIST, data)
      return normalizeIngredient(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.all })
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_ALL_KEY })
    },
  })
}

// ── Update Mutation ──────────────────────────────────────────────────

export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation<Ingredient, Error, { id: string; data: UpdateIngredientDto }>({
    mutationFn: async ({ id, data }) => {
      const response = await patch<IngredientRaw>(ENDPOINTS.INGREDIENTS_DETAIL(id), data)
      return normalizeIngredient(response.data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.all })
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_ALL_KEY })
      // Trigger re-query for dependent features:
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
    },
  })
}

// ── Delete Mutation ──────────────────────────────────────────────────

export function useDeleteIngredient() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await del<void>(ENDPOINTS.INGREDIENTS_DETAIL(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.all })
      queryClient.invalidateQueries({ queryKey: INGREDIENTS_ALL_KEY })
      // Trigger re-query for dependent features:
      queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_KEY })
      queryClient.invalidateQueries({ queryKey: productsKeys.all })
    },
  })
}
