import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useProductsList, useCreateProduct, useUpdateProduct, useDeleteProduct } from './hooks/useProducts'
import { ProductTable } from './components/ProductTable'
import { ProductForm } from './components/ProductForm'
import { DeleteProductDialog } from './components/DeleteProductDialog'
import { Modal } from '@shared/components/Modal'
import { Button } from '@shared/components/Button'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import type { PaginatedResponse } from '@shared/api/client'
import type { Product, CreateProductDto, UpdateProductDto } from '@entities/product'
import type { CategoryRaw, Category } from '@entities/category'
import type { IngredientRaw, Ingredient } from '@entities/ingredient'
import { normalizeCategory } from '@entities/category'
import { normalizeIngredient } from '@entities/ingredient'
import { isAxiosError } from 'axios'

const PAGE_SIZE = 20

interface FormErrors {
  name?: string
  price?: string
  description?: string
  image_url?: string
  category_id?: string
}

function validateName(name: string): string | undefined {
  if (!name || !name.trim()) return 'El nombre es obligatorio'
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
  if (name.trim().length > 200) return 'El nombre no puede exceder los 200 caracteres'
  return undefined
}

function validatePrice(price: number | undefined | string): string | undefined {
  if (price === undefined || price === '' || price === null) return 'El precio es obligatorio'
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num) || num <= 0) return 'El precio debe ser un número positivo'
  return undefined
}

const emptyFormData: CreateProductDto = {
  name: '',
  description: '',
  price: 0,
  currency: 'ARS',
  image_url: '',
  is_available: true,
  category_id: '',
  ingredientes: [],
}

export function ProductListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')

  const { data, isLoading } = useProductsList(page, PAGE_SIZE, debouncedSearch || null, filterCategoryId || null)

  // ── Fetch all categories (for table lookup + form dropdown) ─────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const response = await get<PaginatedResponse<CategoryRaw>>(ENDPOINTS.CATEGORIES_LIST, { page: 1, size: 100 })
      return response.data.items.map(normalizeCategory)
    },
    staleTime: 5 * 60 * 1000,
  })

  // ── Fetch all ingredients (for form ingredient picker) ──────────────
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients', 'all'],
    queryFn: async () => {
      const response = await get<PaginatedResponse<IngredientRaw>>(ENDPOINTS.INGREDIENTS_LIST, { page: 1, size: 100 })
      return response.data.items.map(normalizeIngredient)
    },
    staleTime: 5 * 60 * 1000,
  })

  const categories: Category[] = categoriesData ?? []
  const ingredients: Ingredient[] = ingredientsData ?? []

  // Build category name lookup map
  const categoryNames = useMemo(
    () =>
      Object.fromEntries(categories.map((cat) => [cat.id, cat.name])),
    [categories]
  )

  // ── Search debounce ──────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearch(value)
      // Simple debounce via timeout
      const timer = setTimeout(() => {
        setDebouncedSearch(value)
        setPage(1)
      }, 400)
      return () => clearTimeout(timer)
    },
    []
  )

  // ── Modal state ─────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<CreateProductDto | UpdateProductDto>(emptyFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // ── Delete state ────────────────────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // ── Mutations ───────────────────────────────────────────────────────
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  // ── Create / Edit handlers ──────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setSelectedProduct(null)
    setFormData(emptyFormData)
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const openEditModal = useCallback((product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      image_url: product.imageUrl,
      is_available: product.isAvailable,
      category_id: product.categoryId,
      ingredientes: product.ingredientes?.map((i) => ({
        ingredient_id: i.ingredientId,
        quantity: i.quantity,
      })) ?? [],
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setSelectedProduct(null)
    setFormErrors({})
  }, [])

  const handleFormSubmit = useCallback(async () => {
    // Validation
    const nameValue = 'name' in formData ? formData.name ?? '' : ''
    const nameError = validateName(nameValue)
    const priceValue = 'price' in formData ? formData.price : undefined
    const priceError = validatePrice(priceValue)

    const errors: FormErrors = {}
    if (nameError) errors.name = nameError
    if (priceError) errors.price = priceError

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    try {
      if (selectedProduct) {
        await updateMutation.mutateAsync({ id: selectedProduct.id, data: formData as UpdateProductDto })
      } else {
        await createMutation.mutateAsync(formData as CreateProductDto)
      }
      closeFormModal()
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setFormErrors({ name: err.response.data.detail })
      }
    }
  }, [formData, selectedProduct, createMutation, updateMutation, closeFormModal])

  // ── Delete handlers ──────────────────────────────────────────────────

  const openDeleteDialog = useCallback((product: Product) => {
    setProductToDelete(product)
    setConflictError(null)
    setIsDeleteOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteOpen(false)
    setProductToDelete(null)
    setConflictError(null)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!productToDelete) return

    try {
      await deleteMutation.mutateAsync(productToDelete.id)
      closeDeleteDialog()
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          const message = (err.response.data as { detail?: string })?.detail ?? 'El producto tiene pedidos asociados y no puede ser eliminado.'
          setConflictError(message)
          return
        }
      }
    }
  }, [productToDelete, deleteMutation, closeDeleteDialog])

  // ── Render ─────────────────────────────────────────────────────────

  const products = data?.items ?? []
  const total = data?.total ?? 0
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra el catálogo de productos
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Nuevo Producto
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={handleSearchChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
            aria-label="Buscar productos"
          />
        </div>
        <div className="w-64">
          <select
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value)
              setPage(1)
            }}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        total={total}
        page={page}
        size={PAGE_SIZE}
        categoryNames={categoryNames}
        onPageChange={setPage}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeFormModal} disabled={isMutating}>
              Cancelar
            </Button>
            <Button onClick={handleFormSubmit} isLoading={isMutating}>
              {selectedProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </>
        }
      >
        <ProductForm
          formData={formData}
          onChange={setFormData}
          errors={formErrors}
          selectedProduct={selectedProduct}
          categories={categories}
          ingredients={ingredients}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        product={productToDelete}
        isPending={deleteMutation.isPending}
        conflictError={conflictError}
        onClearError={() => setConflictError(null)}
      />
    </div>
  )
}
