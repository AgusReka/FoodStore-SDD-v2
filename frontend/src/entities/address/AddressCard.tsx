interface Address {
  id: string
  street: string
  city: string
  postal_code: string
  is_primary?: boolean
}

interface AddressCardProps {
  address: Address
  isSelected: boolean
  onSelect: (id: string) => void
}

export function AddressCard({ address, isSelected, onSelect }: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{address.street}</p>
          <p className="text-sm text-gray-500">{address.city}</p>
          <p className="text-sm text-gray-400">{address.postal_code}</p>
        </div>
        {address.is_primary && (
          <span className="text-xs font-medium text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-1 rounded-full">
            Principal
          </span>
        )}
      </div>
    </button>
  )
}
