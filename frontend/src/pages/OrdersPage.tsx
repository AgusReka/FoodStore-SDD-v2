import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrdersList } from '@features/orders/hooks/useOrders'
import { OrderList } from '@entities/order/OrderList'
import EmptyState from '@widgets/EmptyState'

const STATUS_FILTERS = [
  { value: null, label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
]

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--r-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              width: 120,
              height: 16,
              borderRadius: 6,
              background:
                'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: 160,
              height: 12,
              borderRadius: 6,
              background:
                'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite 0.1s',
            }}
          />
        </div>
        <div
          style={{
            width: 80,
            height: 28,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.2s',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 80,
            height: 14,
            borderRadius: 6,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.3s',
          }}
        />
        <div
          style={{
            width: 100,
            height: 20,
            borderRadius: 6,
            background:
              'linear-gradient(90deg, var(--surface) 25%, var(--surface-warm) 50%, var(--surface) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite 0.4s',
          }}
        />
      </div>
    </div>
  )
}

const OrdersPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const size = 10

  const { data, isLoading, isError, refetch } = useOrdersList(page, size, statusFilter)

  const handleFilterChange = (value: string | null) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 600,
          fontSize: 'clamp(28px, 3vw, 36px)',
          color: 'var(--ink-1)',
          margin: '0 0 6px',
        }}
      >
        Mis Pedidos
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        Historial de pedidos realizados
      </p>

      {/* Status filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '4px 0 24px',
          marginBottom: 4,
        }}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.value
          return (
            <button
              key={filter.value ?? 'all'}
              type="button"
              onClick={() => handleFilterChange(filter.value)}
              style={{
                whiteSpace: 'nowrap',
                height: 38,
                padding: '0 16px',
                borderRadius: 999,
                background: isActive ? 'var(--ink-1)' : 'var(--bg-elevated)',
                color: isActive ? 'white' : 'var(--ink-1)',
                border: isActive
                  ? '1px solid var(--ink-1)'
                  : '1px solid var(--line)',
                fontWeight: 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 180ms',
                boxShadow: isActive
                  ? '0 6px 16px rgba(20,16,12,0.12)'
                  : 'var(--shadow-xs)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }
              }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <style>{`
            @keyframes shimmer {
              from { background-position: 200% 0; }
              to { background-position: -200% 0; }
            }
          `}</style>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: 'rgba(230,57,70,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warm-red)',
              margin: '0 auto 16px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink-1)',
              margin: '0 0 4px',
            }}
          >
            Ocurrió un error
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink-3)',
              margin: '0 0 20px',
            }}
          >
            No pudimos cargar tus pedidos
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8h12l-1 12.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          }
          title={
            statusFilter
              ? 'No hay pedidos con ese estado'
              : 'Todavía no tenés pedidos'
          }
          description={
            statusFilter
              ? 'Probá con otro filtro'
              : 'Hacé tu primer pedido para verlo acá'
          }
          action={
            statusFilter
              ? {
                  label: 'Ver todos',
                  onClick: () => handleFilterChange(null),
                }
              : {
                  label: 'Ver productos',
                  onClick: () => navigate('/'),
                }
          }
        />
      )}

      {/* Order list */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <OrderList
          orders={data.items}
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default OrdersPage
