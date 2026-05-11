import { Input } from '@shared/components/Input'
import type {
  CreateProductDto,
  UpdateProductDto,
  Product,
  ProductIngredientCreateDto,
} from '@entities/product'
import type { Category } from '@entities/category'
import type { Ingredient } from '@entities/ingredient'

interface FormErrors {
  name?: string
  description?: string
  price?: string
  currency?: string
  image_url?: string
  category_id?: string
  stock_cantidad?: string
}

interface ProductFormProps {
  formData: CreateProductDto | UpdateProductDto
  onChange: (data: CreateProductDto | UpdateProductDto) => void
  errors: FormErrors
  selectedProduct: Product | null
  categories: Category[]
  ingredients: Ingredient[]
}

export function ProductForm({
  formData,
  onChange,
  errors,
  selectedProduct,
  categories,
  ingredients,
}: ProductFormProps) {
  const isEditing = !!selectedProduct

  const handleChange = (field: string, value: string | number | boolean | null) => {
    onChange({ ...formData, [field]: value ?? null })
  }

  // ── Ingredient management ───────────────────────────────────────────

  const currentIngredients: ProductIngredientCreateDto[] =
    ('ingredientes' in formData ? formData.ingredientes : null) ?? []

  const hasIngredients = currentIngredients.length > 0

  const addIngredient = (ingredientId: string) => {
    if (currentIngredients.some((i) => i.ingredient_id === ingredientId)) return
    onChange({
      ...formData,
      ingredientes: [...currentIngredients, { ingredient_id: ingredientId, quantity: 1 }],
    })
  }

  const removeIngredient = (ingredientId: string) => {
    onChange({
      ...formData,
      ingredientes: currentIngredients.filter((i) => i.ingredient_id !== ingredientId),
    })
  }

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    onChange({
      ...formData,
      ingredientes: currentIngredients.map((i) =>
        i.ingredient_id === ingredientId ? { ...i, quantity } : i
      ),
    })
  }

  const availableIngredients = ingredients.filter(
    (ing) => !currentIngredients.some((ci) => ci.ingredient_id === ing.id)
  )

  // Calculate stock display for compound products
  const stockDisplay = (() => {
    if (!hasIngredients) return null
    const selectedProductStock = selectedProduct?.stockDisponible
    if (selectedProductStock != null) {
      return `${selectedProductStock} uds. (calculado)`
    }
    return '— uds. (calculado a confirmar)'
  })()

  return (
    <div className="space-y-6">
      {/* ── Basic Information ────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Información básica</h3>
        <div className="space-y-4">
          <Input
            label="Nombre"
            name="name"
            placeholder="Ej: Pizza Mozzarella"
            value={'name' in formData ? (formData as CreateProductDto).name ?? '' : ''}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            autoFocus
          />

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Descripción opcional del producto"
              value={(formData as CreateProductDto).description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`
                block w-full rounded-lg border px-3 py-2 text-sm shadow-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-offset-0
                disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
                ${errors.description ? 'border-red-300 focus:border-red-400 focus:ring-red-500' : 'border-gray-300 focus:border-blue-400 focus:ring-blue-500'}
              `.trim()}
              aria-invalid={errors.description ? 'true' : undefined}
            />
            {errors.description && (
              <p className="text-sm text-red-600" role="alert">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="1500.00"
              value={'price' in formData ? (formData as CreateProductDto).price ?? '' : ''}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || '')}
              error={errors.price}
              required
            />
            <Input
              label="Moneda"
              name="currency"
              placeholder="ARS"
              value={(formData as CreateProductDto).currency ?? 'ARS'}
              onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
              error={errors.currency}
            />
          </div>

          <Input
            label="URL de imagen (opcional)"
            name="image_url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={(formData as CreateProductDto).image_url ?? ''}
            onChange={(e) => handleChange('image_url', e.target.value)}
            error={errors.image_url}
          />
        </div>
      </div>

      {/* ── Category ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Categoría</h3>
        <div className="space-y-1">
          <select
            id="category_id"
            name="category_id"
            value={(formData as CreateProductDto).category_id ?? ''}
            onChange={(e) => handleChange('category_id', e.target.value)}
            className={`
              block w-full rounded-lg border px-3 py-2 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${errors.category_id ? 'border-red-300 focus:border-red-400 focus:ring-red-500' : 'border-gray-300 focus:border-blue-400 focus:ring-blue-500'}
            `.trim()}
            aria-invalid={errors.category_id ? 'true' : undefined}
            required
          >
            <option value="">Seleccionar categoría...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-sm text-red-600" role="alert">{errors.category_id}</p>
          )}
        </div>
      </div>

      {/* ── Stock (condicional) ───────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Stock</h3>
        {hasIngredients ? (
          <div className="bg-blue-50 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Stock calculado por ingredientes:</span>{' '}
              {stockDisplay}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              La disponibilidad se calcula automáticamente desde el stock de ingredientes.
            </p>
          </div>
        ) : (
          <Input
            label="Stock disponible"
            name="stock_cantidad"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={'stock_cantidad' in formData ? (formData as CreateProductDto).stock_cantidad ?? '' : ''}
            onChange={(e) => handleChange('stock_cantidad', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
            error={errors.stock_cantidad}
          />
        )}
      </div>

      {/* ── Ingredients ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Ingredientes</h3>

        {/* Selected ingredients list */}
        <div className="space-y-2 mb-3">
          {currentIngredients.length === 0 && (
            <p className="text-sm text-gray-400 italic">Sin ingredientes seleccionados</p>
          )}
          {currentIngredients.map((item) => {
            const ingredient = ingredients.find((i) => i.id === item.ingredient_id)
            return (
              <div key={item.ingredient_id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm font-medium text-gray-700">
                  {ingredient?.name ?? item.ingredient_id}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Cant:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.quantity}
                    onChange={(e) =>
                      updateIngredientQuantity(item.ingredient_id, parseFloat(e.target.value) || 0)
                    }
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-center focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
                    aria-label={`Cantidad de ${ingredient?.name ?? 'ingrediente'}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(item.ingredient_id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  aria-label={`Eliminar ${ingredient?.name ?? 'ingrediente'}`}
                >
                  Quitar
                </button>
              </div>
            )
          })}
        </div>

        {/* Add ingredient dropdown */}
        {availableIngredients.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) addIngredient(e.target.value)
              e.target.value = '' // Reset after selection
            }}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
            aria-label="Agregar ingrediente"
          >
            <option value="">+ Agregar ingrediente...</option>
            {availableIngredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.unit})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Availability ─────────────────────────────────────────────── */}
      {isEditing && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Disponibilidad</h3>
          <div className="flex items-center gap-2">
            <input
              id="is_available"
              type="checkbox"
              checked={('is_available' in formData ? (formData as UpdateProductDto).is_available : true) ?? true}
              onChange={(e) => handleChange('is_available', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">
              Producto disponible para la venta
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
