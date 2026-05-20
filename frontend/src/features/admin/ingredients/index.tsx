import { useState, useCallback } from 'react'
import { useIngredientsList, useCreateIngredient, useUpdateIngredient, useDeleteIngredient } from './hooks/useIngredients'
import { IngredientTable } from './components/IngredientTable'
import { IngredientForm } from './components/IngredientForm'
import { DeleteIngredientDialog } from './components/DeleteIngredientDialog'
import { Modal } from '@shared/components/Modal'
import { Button } from '@shared/components/Button'
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto } from '@entities/ingredient'
import { isAxiosError } from 'axios'

const PAGE_SIZE = 20

interface FormErrors {
  name?: string
  unit?: string
  description?: string
  image_url?: string
}

function validateName(name: string): string | undefined {
  if (!name || !name.trim()) return 'El nombre es obligatorio'
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (name.trim().length > 100) return 'El nombre no puede exceder los 100 caracteres'
  return undefined
}

function validateUnit(unit: string): string | undefined {
  if (!unit || !unit.trim()) return 'La unidad de medida es obligatoria'
  if (unit.trim().length > 50) return 'La unidad no puede exceder los 50 caracteres'
  return undefined
}

const emptyFormData: CreateIngredientDto = {
  name: '',
  description: '',
  unit: '',
  stock_actual: 0,
  stock_minimo: 0,
  image_url: '',
}

export function IngredientListPage() {
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const { data, isLoading } = useIngredientsList(page, PAGE_SIZE, showDeleted)

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [formData, setFormData] = useState<CreateIngredientDto | UpdateIngredientDto>(emptyFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Mutations
  const createMutation = useCreateIngredient()
  const updateMutation = useUpdateIngredient()
  const deleteMutation = useDeleteIngredient()

  // ── Create / Edit handlers ──────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setSelectedIngredient(null)
    setFormData(emptyFormData)
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const openEditModal = useCallback((ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setFormData({
      name: ingredient.name,
      description: ingredient.description,
      unit: ingredient.unit,
      stock_actual: ingredient.stockActual,
      stock_minimo: ingredient.stockMinimo,
      image_url: ingredient.imageUrl,
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setSelectedIngredient(null)
    setFormErrors({})
  }, [])

  const handleFormSubmit = useCallback(async () => {
    const nameValue = 'name' in formData ? formData.name ?? '' : ''
    const nameError = validateName(nameValue)
    if (nameError) {
      setFormErrors({ name: nameError })
      return
    }

    const unitValue = 'unit' in formData ? formData.unit ?? '' : ''
    const unitError = validateUnit(unitValue)
    if (unitError) {
      setFormErrors({ unit: unitError })
      return
    }

    setFormErrors({})

    try {
      if (selectedIngredient) {
        await updateMutation.mutateAsync({ id: selectedIngredient.id, data: formData as UpdateIngredientDto })
      } else {
        await createMutation.mutateAsync(formData as CreateIngredientDto)
      }
      closeFormModal()
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setFormErrors({ name: err.response.data.detail })
      }
    }
  }, [formData, selectedIngredient, createMutation, updateMutation, closeFormModal])

  // ── Delete handlers ──────────────────────────────────────────────────

  const openDeleteDialog = useCallback((ingredient: Ingredient) => {
    setIngredientToDelete(ingredient)
    setConflictError(null)
    setIsDeleteOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteOpen(false)
    setIngredientToDelete(null)
    setConflictError(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!ingredientToDelete) return

    try {
      await deleteMutation.mutateAsync(ingredientToDelete.id)
      closeDeleteDialog()
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          const message = (err.response.data as { detail?: string })?.detail ?? 'El ingrediente tiene productos asociados y no puede ser eliminado.'
          setConflictError(message)
          return
        }
      }
      setConflictError('Ocurrió un error inesperado. Intente nuevamente.')
    }
  }, [ingredientToDelete, deleteMutation, closeDeleteDialog])

  // ── Render ─────────────────────────────────────────────────────────

  const ingredients = data?.items ?? []
  const total = data?.total ?? 0
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los ingredientes para los productos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked)
                setPage(1)
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar eliminados
          </label>
          <Button onClick={openCreateModal}>
            + Nuevo Ingrediente
          </Button>
        </div>
      </div>

      {/* Table */}
      <IngredientTable
        ingredients={ingredients}
        isLoading={isLoading}
        total={total}
        page={page}
        size={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={selectedIngredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
        footer={
          <>
            <Button variant="secondary" onClick={closeFormModal} disabled={isMutating}>
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit} isLoading={isMutating}>
              {selectedIngredient ? 'Guardar cambios' : 'Crear ingrediente'}
            </Button>
          </>
        }
      >
        <IngredientForm
          formData={formData}
          onChange={setFormData}
          errors={formErrors}
          selectedIngredient={selectedIngredient}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteIngredientDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        ingredient={ingredientToDelete}
        isPending={deleteMutation.isPending}
        conflictError={conflictError}
        onClearError={() => setConflictError(null)}
      />
    </div>
  )
}
