import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        minHeight: 280,
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--r-lg)',
            background: 'var(--brand-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)',
            marginBottom: 20,
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 600,
          fontSize: 19,
          lineHeight: 1.24,
          color: 'var(--ink-1)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontFamily: 'var(--ff-body)',
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--ink-3)',
            margin: 0,
            marginBottom: 24,
            maxWidth: 320,
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
