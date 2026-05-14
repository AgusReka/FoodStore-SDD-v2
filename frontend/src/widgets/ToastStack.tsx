import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'

// --- Types ---

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  addToast: (message: string, kind?: ToastKind) => void
}

// --- Context ---

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

// --- Individual Toast ---

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const iconByKind: Record<ToastKind, string> = {
    success: 'check',
    error: 'close',
    info: 'sparkle',
  }

  const colorsByKind: Record<ToastKind, { bg: string; border: string; iconColor: string }> = {
    success: { bg: '#F0F7EA', border: 'rgba(94,138,58,0.2)', iconColor: 'var(--leaf)' },
    error: { bg: '#FEF0EF', border: 'rgba(230,57,70,0.2)', iconColor: 'var(--warm-red)' },
    info: { bg: '#FFF5E8', border: 'rgba(255,122,0,0.2)', iconColor: 'var(--brand)' },
  }

  const colors = colorsByKind[toast.kind]

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        background: colors.bg,
        borderRadius: 'var(--r-md)',
        border: `1px solid ${colors.border}`,
        boxShadow: 'var(--shadow-md)',
        animation: 'toast-in 320ms var(--ease-out)',
        pointerEvents: 'auto',
        maxWidth: 380,
      }}
    >
      <MesaIcon name={iconByKind[toast.kind]} size={18} color={colors.iconColor} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          background: 'transparent',
          cursor: 'pointer',
          border: 'none',
          color: 'var(--ink-3)',
          transition: 'background var(--d-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,16,12,0.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <MesaIcon name="close" size={14} />
      </button>
    </div>
  )
}

// --- Stack Container ---

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => [...prev, { id, message, kind }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast stack — fixed bottom-center */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// --- Minimal Mesa Icon subset for Toasts ---

function MesaIcon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color || 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'check':
      return (
        <svg {...props}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      )
    case 'close':
      return (
        <svg {...props}>
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
        </svg>
      )
    default:
      return null
  }
}
