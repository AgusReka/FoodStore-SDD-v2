import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/authStore'
import { validateRequired, validateEmail } from '@shared/utils/validation'

const LoginForm = () => {
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const hasError = useAuthStore((s) => s.hasError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (hasError) {
      setPassword('')
      setApiError('Email o contraseña incorrectos')
    }
  }, [hasError])

  const validate = (): boolean => {
    const errors: Record<string, string | null> = {
      email: validateEmail(email),
      password: validateRequired(password, 'La contraseña'),
    }
    setFieldErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    try {
      await login(email, password)
    } catch {
      // hasError is set by the store on failure
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>

      {apiError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-gray-700 text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="tu@email.com"
            disabled={isLoading}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-gray-700 text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Iniciar Sesión
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
          Registrate
        </Link>
      </p>
    </div>
  )
}

export default LoginForm
