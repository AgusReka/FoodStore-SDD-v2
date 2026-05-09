import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/authStore'
import LoginForm from '@features/auth/LoginForm'

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accessToken = useAuthStore((s) => s.accessToken)

  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (accessToken) {
      navigate(redirectTo, { replace: true })
    }
  }, [accessToken, navigate, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Iniciar Sesión
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
