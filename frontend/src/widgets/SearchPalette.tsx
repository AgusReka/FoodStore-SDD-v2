import { useState, useEffect, useRef } from 'react'

/* ──── SearchPalette ──── */

interface SearchPaletteProps {
  onClose: () => void
  onNavigate: (path: string) => void
}

export function SearchPalette({ onClose, onNavigate }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: string; name: string; price: number }>>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | undefined>(undefined)
  const isMobile = window.innerWidth < 768

  // Auto-focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Debounced search via API
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(-1)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { get } = await import('@shared/api/client')
        const { ENDPOINTS } = await import('@shared/api/endpoints')
        const res = await get<{ items: Array<{ id: string; name: string; price: number }> }>(
          ENDPOINTS.PRODUCTS_LIST,
          { search: query, size: 8 }
        )
        setResults(res.data?.items ?? [])
        setSelectedIndex(-1)
      } catch {
        setResults([])
      }
    }, 220)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
      return
    }
    if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      onNavigate(`/productos/${results[selectedIndex].id}`)
      return
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(20,16,12,0.4)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fade-in 180ms var(--ease-out)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          zIndex: 201,
          ...(isMobile
            ? { inset: 0, top: 80, padding: '0 16px' }
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 560,
                maxWidth: 'calc(100vw - 32px)',
              }),
          animation: 'float-up 0.35s var(--ease-spring)',
        }}
      >
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: isMobile ? 'var(--r-xl)' : 'var(--r-xl)',
            boxShadow: 'var(--shadow-float)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar platos, chefs, categorías…"
              style={{
                flex: 1,
                height: 40,
                border: 'none',
                background: 'transparent',
                fontSize: 16,
                color: 'var(--ink-1)',
                outline: 'none',
                fontFamily: 'var(--ff-body)',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: 'var(--surface)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: 'var(--surface)',
                border: 'none',
                color: 'var(--ink-3)',
                fontSize: 11,
                fontFamily: 'var(--ff-mono)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div
            style={{
              maxHeight: isMobile ? 'calc(100vh - 200px)' : 360,
              overflow: 'auto',
              padding: query.trim() && results.length === 0 ? '40px 20px' : '8px',
            }}
          >
            {!query.trim() && (
              <div style={{ padding: '32px 12px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: 0 }}>
                  Escribí para buscar productos
                </p>
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: 'var(--ink-3)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, margin: '0 0 4px' }}>
                  Sin resultados
                </p>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
                  No encontramos nada para «{query}»
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '4px 12px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                  }}
                >
                  Platos
                </div>
                {results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => onNavigate(`/productos/${product.id}`)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      border: 'none',
                      background:
                        selectedIndex === i ? 'var(--brand-soft)' : 'transparent',
                      color: 'var(--ink-1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 80ms',
                    }}
                  >
                    <div
                      className="food-art citrus"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-sm)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </div>
                    </div>
                    <span
                      className="num"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--ink-2)',
                      }}
                    >
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
