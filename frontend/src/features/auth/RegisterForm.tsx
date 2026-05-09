import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { validateRequired, validateEmail, validatePassword, validatePasswordsMatch } from '@shared/utils/validation'

interface RegisterFormProps {
  onSuccess?: (email: string) => void
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register, isRegistering, registerError } = useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  const errorMessage = registerError instanceof Error ? registerError.message : null

  const validate = (): boolean => {
    const pwResult = validatePassword(password)
    const errors: Record<string, string | null> = {
      email: validateEmail(email),
      username: validateRequired(username, 'El nombre de usuario'),
      firstName: validateRequired(firstName, 'El nombre'),
      lastName: validateRequired(lastName, 'El apellido'),
      password: pwResult.valid ? null : pwResult.errors[0],
      confirmPassword: validatePasswordsMatch(password, confirmPassword),
    }
    setFieldErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await register({
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        password,
        phone: phone || undefined,
      })
      onSuccess?.(email)
    } catch {
      // registerError is set by the mutation
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear Cuenta</h2>

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first-name" className="block text-gray-700 text-sm font-medium mb-1">Nombre</label>
            <input
              id="reg-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="Juan"
              disabled={isRegistering}
            />
            {fieldErrors.firstName && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="reg-last-name" className="block text-gray-700 text-sm font-medium mb-1">Apellido</label>
            <input
              id="reg-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="Pérez"
              disabled={isRegistering}
            />
            {fieldErrors.lastName && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="tu@email.com"
            disabled={isRegistering}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="reg-username" className="block text-gray-700 text-sm font-medium mb-1">Nombre de usuario</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="juanperez"
            disabled={isRegistering}
            autoComplete="username"
          />
          {fieldErrors.username && <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>}
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-gray-700 text-sm font-medium mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="+54 11 1234-5678"
            disabled={isRegistering}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-gray-700 text-sm font-medium mb-1">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="••••••••"
            disabled={isRegistering}
            autoComplete="new-password"
          />
          {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="reg-confirm-password" className="block text-gray-700 text-sm font-medium mb-1">Confirmar contraseña</label>
          <input
            id="reg-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="••••••••"
            disabled={isRegistering}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRegistering && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Crear Cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}

export default RegisterForm
