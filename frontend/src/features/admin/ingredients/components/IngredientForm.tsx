import { Input } from '@shared/components/Input'
import type { CreateIngredientDto, UpdateIngredientDto, Ingredient } from '@entities/ingredient'

interface FormErrors {
  name?: string
  unit?: string
  description?: string
  image_url?: string
  stock_actual?: string
  stock_minimo?: string
}

interface IngredientFormProps {
  formData: CreateIngredientDto | UpdateIngredientDto
  onChange: (data: CreateIngredientDto | UpdateIngredientDto) => void
  errors: FormErrors
  selectedIngredient: Ingredient | null
}

export function IngredientForm({ formData, onChange, errors }: IngredientFormProps) {
  const handleChange = (field: string, value: string | number | null) => {
    onChange({ ...formData, [field]: value ?? null })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nombre"
        name="name"
        placeholder="Ej: Harina"
        value={'name' in formData ? (formData as CreateIngredientDto).name ?? '' : ''}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        autoFocus
      />

      <Input
        label="Unidad de medida"
        name="unit"
        placeholder="Ej: kg, g, unidad, litro, ml"
        value={(formData as CreateIngredientDto).unit ?? ''}
        onChange={(e) => handleChange('unit', e.target.value)}
        error={errors.unit}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock actual"
          name="stock_actual"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          value={'stock_actual' in formData ? (formData as CreateIngredientDto).stock_actual ?? 0 : 0}
          onChange={(e) => handleChange('stock_actual', parseFloat(e.target.value) || 0)}
          error={errors.stock_actual}
        />
        <Input
          label="Stock mínimo"
          name="stock_minimo"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          value={'stock_minimo' in formData ? (formData as CreateIngredientDto).stock_minimo ?? 0 : 0}
          onChange={(e) => handleChange('stock_minimo', parseFloat(e.target.value) || 0)}
          error={errors.stock_minimo}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Descripción opcional del ingrediente"
          value={(formData as CreateIngredientDto).description ?? ''}
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

      <Input
        label="URL de imagen (opcional)"
        name="image_url"
        placeholder="https://ejemplo.com/imagen.jpg"
        value={(formData as CreateIngredientDto).image_url ?? ''}
        onChange={(e) => handleChange('image_url', e.target.value)}
        error={errors.image_url}
      />
    </div>
  )
}
