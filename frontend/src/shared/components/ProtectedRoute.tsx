import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/authStore'

interface ProtectedRouteProps {
  requiredRole?: string | string[]
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const profileLoading = useAuthStore((s) => s.profileLoading)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const location = useLocation()

  // If we have a token but no user data yet, trigger the profile fetch
  useEffect(() => {
    if (accessToken && !user && !profileLoading && !isLoading) {
      fetchProfile()
    }
  }, [accessToken, user, profileLoading, isLoading, fetchProfile])

  // Wait for any pending authentication or profile loading
  if (isLoading || profileLoading || (accessToken && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--brand)] border-t-transparent rounded-full" />
      </div>
    )
  }

  // No token → redirect to login
  if (!accessToken) {
    const redirectPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />
  }

  // Has token but wrong role → redirect home
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
