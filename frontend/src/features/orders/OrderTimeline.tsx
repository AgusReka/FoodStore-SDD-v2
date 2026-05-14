import { STATUS_TIMELINE_STEPS, STATUS_ORDER, type OrderStatus } from '@shared/constants/orderStatus'

interface OrderTimelineProps {
  status: string
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER[status as OrderStatus] ?? -1
  const isCancelled = status === 'cancelado'

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {STATUS_TIMELINE_STEPS.map((step, index) => {
          const isCompleted = !isCancelled && currentIndex >= index
          const isCurrent = !isCancelled && currentIndex === index

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`h-0.5 w-full -mb-3 transition-colors ${
                    isCompleted ? 'bg-[var(--brand)]' : 'bg-gray-200'
                  }`}
                  style={{ marginLeft: '-50%', width: '100%' }}
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCancelled
                    ? 'bg-red-100 text-red-600 border-2 border-red-300'
                    : isCompleted
                      ? 'bg-[var(--brand)] text-white'
                      : isCurrent
                        ? 'bg-[var(--brand-soft)] text-[var(--brand)] border-2 border-[var(--brand)]'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                {isCompleted && !isCancelled ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCancelled && index === 1 ? (
                  <span>✕</span>
                ) : (
                  index + 1
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium ${
                  isCancelled
                    ? 'text-red-600'
                    : isCompleted
                      ? 'text-[var(--brand)]'
                      : isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {isCancelled && (
        <p className="text-center text-sm text-red-600 font-medium mt-4">
          Este pedido fue cancelado
        </p>
      )}
    </div>
  )
}
