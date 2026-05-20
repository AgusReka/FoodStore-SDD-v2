// ── Category Entity Types ────────────────────────────────────────────
// Maps to backend CategoriaRead / CategoriaCreate / CategoriaUpdate

export interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export interface CreateCategoryDto {
  name: string
  description?: string | null
  image_url?: string | null
}

export interface UpdateCategoryDto {
  name?: string
  description?: string | null
  image_url?: string | null
  is_active?: boolean
}

/** Raw shape returned by the backend API (snake_case). */
export interface CategoryRaw {
  id: string
  name: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

/** Convert a raw API response to the camelCase frontend type. */
export function normalizeCategory(raw: CategoryRaw): Category {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    imageUrl: raw.image_url,
    isActive: raw.is_active,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at,
  }
}
