// ── Ingredient Entity Types ──────────────────────────────────────────
// Maps to backend IngredientRead / IngredientCreate / IngredientUpdate

export interface Ingredient {
  id: string
  name: string
  description: string | null
  unit: string
  stockActual: number
  stockMinimo: number
  stockSuficiente: boolean
  imageUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CreateIngredientDto {
  name: string
  description?: string | null
  unit: string
  stock_actual?: number
  stock_minimo?: number
  image_url?: string | null
}

export interface UpdateIngredientDto {
  name?: string
  description?: string | null
  unit?: string
  stock_actual?: number
  stock_minimo?: number
  image_url?: string | null
}

/** Raw shape returned by the backend API (snake_case). */
export interface IngredientRaw {
  id: string
  name: string
  description: string | null
  unit: string
  stock_actual: number
  stock_minimo: number
  stock_suficiente: boolean
  image_url: string | null
  created_at: string
  updated_at: string | null
}

/** Convert a raw API response to the camelCase frontend type. */
export function normalizeIngredient(raw: IngredientRaw): Ingredient {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    unit: raw.unit,
    stockActual: raw.stock_actual,
    stockMinimo: raw.stock_minimo,
    stockSuficiente: raw.stock_suficiente,
    imageUrl: raw.image_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
