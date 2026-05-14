import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { validateRequired, validateEmail, validatePassword, validatePasswordsMatch } from '@shared/utils/validation'
import { CONFIG } from '@shared/config/brand'

interface RegisterFormProps {
  onSuccess?: (email: string, password: string) => void
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register, isRegistering, registerError } = useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  const errorMessage = registerError instanceof Error ? registerError.message : null

  const inputClass = "w-full h-12 px-4 bg-[var(--surface)] border border-transparent rounded-[var(--r-sm)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] transition-all duration-[var(--d-fast)] ease-[var(--ease-out)] focus:outline-none focus:bg-[var(--bg-elevated)] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)]"

  const getStrength = (pw: string): number => {
    if (!pw) return 0
    if (pw.length <= 3) return 1
    if (pw.length <= 5) return 2
    if (pw.length <= 7) return 3
    return 4
  }

  const strength = getStrength(password)

  const strengthSegments = [0, 1, 2, 3].map((i) => {
    if (i >= strength) return '#E5E3DF'
    if (strength === 1) return 'var(--warm-red)'
    if (strength === 2) return 'var(--warm-yellow)'
    if (strength === 3) return i < 2 ? 'var(--warm-yellow)' : 'var(--leaf)'
    return 'var(--leaf)'
  })

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
      onSuccess?.(email, password)
    } catch {
      // registerError is set by the mutation
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] flex items-center justify-center shadow-[var(--shadow-brand)]">
          <span className="text-white text-2xl font-bold leading-none">{CONFIG.logoChar}</span>
        </div>
        <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] tracking-[-0.02em] mb-1">
          Crear tu cuenta
        </h1>
        <p className="text-sm text-[var(--ink-3)]">
          Unite a {CONFIG.brand} y pedí tu comida favorita
        </p>
      </div>

      <button
        type="button"
        className="w-full h-12 flex items-center justify-center gap-3 rounded-[var(--r-pill)] bg-[var(--surface)] text-sm font-medium text-[var(--ink-1)] hover:bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-sm)] border border-[var(--line)] transition-all duration-[var(--d-fast)] ease-[var(--ease-out)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--line)]" />
        <span className="text-xs text-[var(--ink-3)] font-medium">O</span>
        <div className="flex-1 h-px bg-[var(--line)]" />
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-sm text-sm" style={{ background: 'rgba(230,57,70,0.08)', color: 'var(--warm-red)' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              id="reg-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              placeholder="Nombre"
              disabled={isRegistering}
            />
            {fieldErrors.firstName && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.firstName}</p>}
          </div>
          <div>
            <input
              id="reg-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              placeholder="Apellido"
              disabled={isRegistering}
            />
            {fieldErrors.lastName && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="Email"
            disabled={isRegistering}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.email}</p>}
        </div>

        <div>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            placeholder="Nombre de usuario"
            disabled={isRegistering}
            autoComplete="username"
          />
          {fieldErrors.username && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.username}</p>}
        </div>

        <div>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="Teléfono (opcional)"
            disabled={isRegistering}
            autoComplete="tel"
          />
        </div>

        <div>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + ' pr-20'}
              placeholder="Contraseña"
              disabled={isRegistering}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink-2)]"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.password}</p>}
          {password && (
            <div className="flex gap-2 mt-2">
              {strengthSegments.map((color, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-[var(--d-fast)]"
                  style={{ background: color }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass + ' pr-20'}
              placeholder="Confirmar contraseña"
              disabled={isRegistering}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink-2)]"
            >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="text-xs mt-1.5" style={{ color: 'var(--warm-red)' }}>{fieldErrors.confirmPassword}</p>}
        </div>

        <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
          Al registrarte, aceptas nuestros{' '}
          <a href="/terminos" className="font-medium" style={{ color: 'var(--brand)' }}>Términos y Condiciones</a>
        </p>

        <button
          type="submit"
          disabled={isRegistering}
          className="btn btn-primary btn-lg w-full"
        >
          {isRegistering && (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="white" opacity="0.75" />
            </svg>
          )}
          Crear Cuenta
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium" style={{ color: 'var(--brand)' }}>
          Iniciá sesión
        </Link>
      </p>
    </>
  )
}

export default RegisterForm
