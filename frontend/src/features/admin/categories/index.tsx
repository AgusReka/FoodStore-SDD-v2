import { useState, useCallback } from 'react'
import { useCategoriesList, useCreateCategory, useUpdateCategory, useDeleteCategory } from './hooks/useCategories'
import { CategoryTable } from './components/CategoryTable'
import { CategoryForm } from './components/CategoryForm'
import { DeleteCategoryDialog } from './components/DeleteCategoryDialog'
import { Modal } from '@shared/components/Modal'
import { Button } from '@shared/components/Button'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@entities/category'
import { isAxiosError } from 'axios'

const PAGE_SIZE = 20

interface FormErrors {
  name?: string
  description?: string
  image_url?: string
}

function validateName(name: string): string | undefined {
  if (!name || !name.trim()) return 'El nombre es obligatorio'
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (name.trim().length > 100) return 'El nombre no puede exceder los 100 caracteres'
  return undefined
}

const emptyFormData: CreateCategoryDto = {
  name: '',
  description: '',
  image_url: '',
}

export function CategoryListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useCategoriesList(page, PAGE_SIZE)

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CreateCategoryDto | UpdateCategoryDto>(emptyFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Mutations
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  // ── Create / Edit handlers ──────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setSelectedCategory(null)
    setFormData(emptyFormData)
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const openEditModal = useCallback((category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      image_url: category.imageUrl,
      is_active: category.isActive,
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setSelectedCategory(null)
    setFormErrors({})
  }, [])

  const handleFormSubmit = useCallback(async () => {
    const nameValue = 'name' in formData ? formData.name ?? '' : ''
    const nameError = validateName(nameValue)
    if (nameError) {
      setFormErrors({ name: nameError })
      return
    }

    setFormErrors({})

    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({ id: selectedCategory.id, data: formData as UpdateCategoryDto })
      } else {
        await createMutation.mutateAsync(formData as CreateCategoryDto)
      }
      closeFormModal()
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setFormErrors({ name: err.response.data.detail })
      }
    }
  }, [formData, selectedCategory, createMutation, updateMutation, closeFormModal])

  // ── Delete handlers ──────────────────────────────────────────────────

  const openDeleteDialog = useCallback((category: Category) => {
    setCategoryToDelete(category)
    setConflictError(null)
    setIsDeleteOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteOpen(false)
    setCategoryToDelete(null)
    setConflictError(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!categoryToDelete) return

    try {
      await deleteMutation.mutateAsync(categoryToDelete.id)
      closeDeleteDialog()
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          const message = (err.response.data as { detail?: string })?.detail ?? 'La categoría tiene productos asociados y no puede ser eliminada.'
          setConflictError(message)
          return
        }
      }
    }
  }, [categoryToDelete, deleteMutation, closeDeleteDialog])

  // ── Render ─────────────────────────────────────────────────────────

  const categories = data?.items ?? []
  const total = data?.total ?? 0
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las categorías de productos
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Nueva Categoría
        </Button>
      </div>

      {/* Table */}
      <CategoryTable
        categories={categories}
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
        title={selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        footer={
          <>
            <Button variant="secondary" onClick={closeFormModal} disabled={isMutating}>
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit} isLoading={isMutating}>
              {selectedCategory ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </>
        }
      >
        <CategoryForm
          formData={formData}
          onChange={setFormData}
          errors={formErrors}
          selectedCategory={selectedCategory}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        category={categoryToDelete}
        isPending={deleteMutation.isPending}
        conflictError={conflictError}
        onClearError={() => setConflictError(null)}
      />
    </div>
  )
}
