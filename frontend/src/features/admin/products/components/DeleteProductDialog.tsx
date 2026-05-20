import { Modal } from '@shared/components/Modal'
import { Button } from '@shared/components/Button'
import type { Product } from '@entities/product'

interface DeleteProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  product: Product | null
  isPending: boolean
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  onConfirm,
  product,
  isPending,
}: DeleteProductDialogProps) {
  if (!isOpen || !product) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Producto"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isPending}>
            Eliminar
          </Button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-gray-700 mb-1">
          ¿Estás seguro de eliminar el producto?
        </p>
        <p className="text-base font-semibold text-gray-900">{product.name}</p>
        <p className="text-sm text-gray-500 mt-3">
          El producto sera ocultado del catalogo y no se podra comprar. Los pedidos existentes conservaran su informacion.
        </p>
      </div>
    </Modal>
  )
}
