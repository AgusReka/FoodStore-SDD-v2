import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { SearchPalette } from '@widgets/SearchPalette'

/* ============================================================
   Mesa Icon subset
   ============================================================ */
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case 'bag':
      return (
        <svg {...props}>
          <path d="M6 8h12l-1 12.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      )
    case 'user':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...props}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
        </svg>
      )
    case 'close':
      return (
        <svg {...props}>
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    default:
      return null
  }
}

/* ============================================================
   Navbar
   ============================================================ */
export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const itemCount = useCartStore((s) => s.itemCount)
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = !!accessToken

  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const toggleCart = useUiStore((s) => s.toggleCart)
  const searchOpen = useUiStore((s) => s.searchOpen)
  const setSearchOpen = useUiStore((s) => s.setSearchOpen)

  const handleCartClick = useCallback(() => {
    toggleCart()
  }, [toggleCart])

  const queryClient = useQueryClient()

  const handleLogout = useCallback(async () => {
    await logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [logout, queryClient, navigate])

  const isActive = (path: string) => location.pathname === path

  const linkStyle = (path: string): CSSProperties => ({
    height: 36,
    padding: '0 14px',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 500,
    color: isActive(path) ? 'var(--ink-1)' : 'var(--ink-2)',
    background: isActive(path) ? 'rgba(20,16,12,0.06)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all var(--d-fast) var(--ease-out)',
  })

  const handleNavHover = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) => {
    if (!isActive(e.currentTarget.getAttribute('data-path') || '')) {
      e.currentTarget.style.background = enter ? 'rgba(20,16,12,0.03)' : 'transparent'
    }
  }

  return (
    <>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div style={{ height: 76 }} />

      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 80,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          pointerEvents: 'none',
        }}
      >
        <nav
          className="glass"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 60,
            padding: '8px 10px 8px 18px',
            borderRadius: 999,
            width: 'min(1180px, 100%)',
            transition: 'all var(--d-med) var(--ease-out)',
            boxShadow: scrolled
              ? '0 14px 40px rgba(20,16,12,0.10), inset 0 1px 0 rgba(255,255,255,0.6)'
              : '0 6px 18px rgba(20,16,12,0.05), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              paddingRight: 12,
              marginRight: 4,
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #FF9933, #FF7A00)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,122,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 6,
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.22)',
                }}
              />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'white',
                  zIndex: 1,
                }}
              />
            </span>
            <span
              className="t-display"
              style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--ink-1)' }}
            >
              FoodStore
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
            className="hide-mobile"
          >
            <button
              data-path="/"
              style={linkStyle('/')}
              onClick={() => navigate('/')}
              onMouseEnter={(e) => handleNavHover(e, true)}
              onMouseLeave={(e) => handleNavHover(e, false)}
            >
              Menú
            </button>

            {isAuthenticated && (
              <>
                <button
                  data-path="/profile"
                  style={linkStyle('/profile')}
                  onClick={() => navigate('/profile')}
                  onMouseEnter={(e) => handleNavHover(e, true)}
                  onMouseLeave={(e) => handleNavHover(e, false)}
                >
                  Mi Perfil
                </button>
                <button
                  data-path="/orders"
                  style={linkStyle('/orders')}
                  onClick={() => navigate('/orders')}
                  onMouseEnter={(e) => handleNavHover(e, true)}
                  onMouseLeave={(e) => handleNavHover(e, false)}
                >
                  Mis Pedidos
                </button>
              </>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Desktop — Search pill */}
          <button
            className="hide-mobile"
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              height: 40,
              padding: '0 16px 0 14px',
              background: 'rgba(20,16,12,0.05)',
              borderRadius: 999,
              border: 'none',
              color: 'var(--ink-3)',
              fontSize: 13.5,
              minWidth: 180,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,16,12,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(20,16,12,0.05)')}
          >
            <Icon name="search" size={16} />
            <span>Buscar comida, chefs…</span>
            <span style={{ flex: 1 }} />
            <span
              className="t-mono"
              style={{
                fontSize: 10,
                padding: '2px 6px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 5,
                color: 'var(--ink-3)',
                letterSpacing: '0.04em',
              }}
            >
              ⌘K
            </span>
          </button>

          {/* User icon */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="btn-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: isActive('/profile') ? 'var(--brand)' : 'var(--ink-2)',
                cursor: 'pointer',
                transition: 'all var(--d-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,16,12,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon name="user" size={20} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-sm"
              style={{
                height: 36,
                padding: '0 14px',
                fontSize: 13,
              }}
            >
              Ingresar
            </button>
          )}

          {/* Cart icon */}
          <div
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              cursor: 'pointer',
              color: isActive('/cart') ? 'var(--brand)' : 'var(--ink-2)',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
            onClick={handleCartClick}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,16,12,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="bag" size={20} />
            {itemCount > 0 && (
              <span
                className="num"
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  background: 'var(--brand)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(255,122,0,0.3)',
                }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="show-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              transition: 'all var(--d-fast) var(--ease-out)',
            }}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </nav>
      </div>

      {/* SearchPalette modal */}
      {searchOpen && (
        <SearchPalette
          onClose={() => setSearchOpen(false)}
          onNavigate={(path) => {
            setSearchOpen(false)
            navigate(path)
          }}
        />
      )}

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 79,
            background: 'rgba(20,16,12,0.36)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fade-in 180ms var(--ease-out)',
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: 88,
              left: 16,
              right: 16,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-lg)',
              padding: 12,
              animation: 'float-up 320ms var(--ease-out)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <MobileLink to="/" label="Menú" current={location.pathname} onClick={() => navigate('/')} />
            {isAuthenticated ? (
              <>
                <MobileLink
                  to="/profile"
                  label="Mi Perfil"
                  current={location.pathname}
                  onClick={() => navigate('/profile')}
                />
                <MobileLink
                  to="/orders"
                  label="Mis Pedidos"
                  current={location.pathname}
                  onClick={() => navigate('/orders')}
                />
                <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--warm-red)',
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background var(--d-fast) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(230,57,70,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" label="Iniciar Sesión" current={location.pathname} onClick={() => navigate('/login')} />
                <MobileLink to="/register" label="Registrarse" current={location.pathname} onClick={() => navigate('/register')} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* Mobile link helper */
function MobileLink({
  to,
  label,
  current,
  onClick,
}: {
  to: string
  label: string
  current: string
  onClick: () => void
}) {
  const active = current === to
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 14,
        border: 'none',
        background: active ? 'var(--brand-soft)' : 'transparent',
        color: active ? 'var(--brand-ink)' : 'var(--ink-1)',
        fontSize: 15,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all var(--d-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) =>
        !active && (e.currentTarget.style.background = 'rgba(20,16,12,0.04)')
      }
      onMouseLeave={(e) =>
        !active && (e.currentTarget.style.background = 'transparent')
      }
    >
      {label}
    </button>
  )
}
