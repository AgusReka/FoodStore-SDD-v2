import { useState, useCallback } from 'react'
import { Modal } from '@shared/components/Modal'
import { Button } from '@shared/components/Button'
import { STATUS_LABELS, getValidTransitions, isTerminalStatus, type OrderStatus } from '@shared/constants/orderStatus'

interface OrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: string
  onConfirm: (newStatus: string, reason?: string) => void
  isPending: boolean
  error: string | null
}

export function OrderStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onConfirm,
  isPending,
  error,
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'select' | 'confirm'>('select')

  const validTransitions = getValidTransitions(currentStatus as OrderStatus)

  // Reset state when modal opens
  const handleClose = useCallback(() => {
    setSelectedStatus('')
    setReason('')
    setStep('select')
    onClose()
  }, [onClose])

  const handleNext = useCallback(() => {
    if (selectedStatus) {
      setStep('confirm')
    }
  }, [selectedStatus])

  const handleConfirm = useCallback(() => {
    if (selectedStatus) {
      onConfirm(selectedStatus, reason || undefined)
    }
  }, [selectedStatus, reason, onConfirm])

  const currentLabel = STATUS_LABELS[currentStatus as OrderStatus] ?? currentStatus

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar Estado del Pedido"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          {step === 'select' ? (
            <Button onClick={handleNext} disabled={!selectedStatus}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleConfirm} isLoading={isPending}>
              Confirmar cambio
            </Button>
          )}
        </>
      }
    >
      {step === 'select' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Estado actual: <span className="font-semibold text-gray-900">{currentLabel}</span>
          </p>

          {isTerminalStatus(currentStatus as OrderStatus) ? (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              Este pedido se encuentra en un estado terminal ({currentLabel}). No se pueden realizar más cambios de estado.
            </p>
          ) : validTransitions.length === 0 ? (
            <p className="text-sm text-gray-500">No hay transiciones válidas desde este estado.</p>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nuevo estado
              </label>
              {validTransitions.map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStatus === status
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="newStatus"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {STATUS_LABELS[status as OrderStatus] ?? status}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Reason field */}
          <div>
            <label htmlFor="status-change-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Razón del cambio <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="status-change-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Pago confirmado, Cliente solicitó cambio..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ¿Estás seguro de cambiar el estado de este pedido?
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Estado actual</span>
              <span className="font-medium text-gray-900">{currentLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Nuevo estado</span>
              <span className="font-medium text-gray-900">
                {STATUS_LABELS[selectedStatus as OrderStatus] ?? selectedStatus}
              </span>
            </div>
            {reason && (
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-500">Razón</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">{reason}</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
        </div>
      )}
    </Modal>
  )
}
