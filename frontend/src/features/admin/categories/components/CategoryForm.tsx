import { Input } from '@shared/components/Input'
import type { CreateCategoryDto, UpdateCategoryDto, Category } from '@entities/category'

interface FormErrors {
  name?: string
  description?: string
  image_url?: string
}

interface CategoryFormProps {
  formData: CreateCategoryDto | UpdateCategoryDto
  onChange: (data: CreateCategoryDto | UpdateCategoryDto) => void
  errors: FormErrors
  selectedCategory: Category | null
}

export function CategoryForm({ formData, onChange, errors, selectedCategory }: CategoryFormProps) {
  const isEditing = !!selectedCategory

  const handleChange = (field: string, value: string) => {
    onChange({ ...formData, [field]: value || null })
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nombre"
        name="name"
        placeholder="Ej: Bebidas"
        value={'name' in formData ? (formData as CreateCategoryDto).name ?? '' : ''}
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
          placeholder="Descripción opcional de la categoría"
          value={(formData as CreateCategoryDto).description ?? ''}
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
        value={(formData as CreateCategoryDto).image_url ?? ''}
        onChange={(e) => handleChange('image_url', e.target.value)}
        error={errors.image_url}
      />

      {isEditing && (
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={('is_active' in formData ? (formData as UpdateCategoryDto).is_active : true) ?? true}
            onChange={(e) =>
              onChange({ ...formData, is_active: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Categoría activa
          </label>
        </div>
      )}
    </div>
  )
}
