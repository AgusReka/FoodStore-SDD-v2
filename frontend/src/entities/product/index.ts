// ── Product Entity Types ──────────────────────────────────────────────
// Maps to backend ProductRead / ProductCreate / ProductUpdate / ProductIngredient

export interface ProductIngredient {
  ingredientId: string
  name: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  imageUrl: string | null
  isAvailable: boolean
  stockCantidad: number | null
  stockDisponible: number | null
  categoryId: string
  ingredientes: ProductIngredient[] | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export interface CreateProductDto {
  name: string
  description?: string | null
  price: number
  currency?: string
  image_url?: string | null
  is_available?: boolean
  stock_cantidad?: number | null
  category_id: string
  ingredientes?: ProductIngredientCreateDto[] | null
}

export interface UpdateProductDto {
  name?: string
  description?: string | null
  price?: number
  currency?: string
  image_url?: string | null
  is_available?: boolean
  stock_cantidad?: number | null
  category_id?: string
  ingredientes?: ProductIngredientCreateDto[] | null
}

export interface ProductIngredientCreateDto {
  ingredient_id: string
  quantity: number
}

/** Raw shape returned by the backend API (snake_case). */
export interface ProductRaw {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  is_available: boolean
  stock_cantidad: number | null
  stock_disponible: number | null
  category_id: string
  ingredientes: ProductIngredientRaw[] | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface ProductIngredientRaw {
  ingredient_id: string
  name: string
  quantity: number
}

/** Convert a raw API response to the camelCase frontend type. */
export function normalizeProduct(raw: ProductRaw): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    currency: raw.currency,
    imageUrl: raw.image_url,
    isAvailable: raw.is_available,
    stockCantidad: raw.stock_cantidad,
    stockDisponible: raw.stock_disponible,
    categoryId: raw.category_id,
    ingredientes: raw.ingredientes?.map((i) => ({
      ingredientId: i.ingredient_id,
      name: i.name,
      quantity: i.quantity,
    })) ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at,
  }
}
