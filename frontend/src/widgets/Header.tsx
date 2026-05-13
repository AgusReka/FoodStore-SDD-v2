import { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '@shared/stores/cartStore'
import { useAuthStore } from '@shared/stores/authStore'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const itemCount = useCartStore((s) => s.itemCount)
  const accessToken = useAuthStore((s) => s.accessToken)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = !!accessToken

  const handleCartClick = useCallback(() => {
    navigate('/cart')
  }, [navigate])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-[var(--brand)]'
        : 'text-[var(--ink-2)] hover:text-[var(--brand)]'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-[var(--brand)] font-bold text-xl cursor-pointer hover:text-[var(--brand-hover)] transition-colors"
        >
          FoodStore
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>
            Menú
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className={linkClass('/profile')}>
                Mi Perfil
              </Link>
              <Link to="/orders" className={linkClass('/orders')}>
                Mis Pedidos
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')}>
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* Mobile nav + cart */}
        <div className="flex items-center gap-2">
          {/* Mobile auth links */}
          <div className="sm:hidden flex items-center gap-2">
            {!isAuthenticated ? (
              <Link to="/login" className="text-sm font-medium text-[var(--brand)]">
                Ingresar
              </Link>
            ) : (
              <Link to="/profile" className="text-sm font-medium text-[var(--brand)]">
                Perfil
              </Link>
            )}
          </div>

          {/* Cart icon */}
          <div className="relative p-2 cursor-pointer hover:text-[var(--brand)] transition-colors" onClick={handleCartClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[var(--brand)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
