import { useState, type FormEvent } from 'react'
import { post } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'

interface AddressFormData {
  street: string
  city: string
  postal_code: string
  street_number?: string
}

interface AddressFormProps {
  onSuccess: (address: AddressFormData & { id: string }) => void
  onCancel: () => void
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const response = await post<AddressFormData & { id: string }>(ENDPOINTS.ADDRESSES_CREATE, {
        street: street.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        ...(streetNumber.trim() ? { street_number: streetNumber.trim() } : {}),
      })
      onSuccess(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la dirección')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Nueva Dirección</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
        <div className="flex gap-2">
          <input
            id="addr-street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            placeholder="Av. San Martín"
            disabled={isSaving}
          />
          <input
            id="addr-street-number"
            type="text"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            placeholder="N°"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="addr-city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            id="addr-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            placeholder="Mendoza"
            disabled={isSaving}
          />
        </div>
        <div>
          <label htmlFor="addr-postal-code" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
          <input
            id="addr-postal-code"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            placeholder="5500"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar dirección'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
