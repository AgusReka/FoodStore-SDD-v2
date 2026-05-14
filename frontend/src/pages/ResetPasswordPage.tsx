import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { CONFIG } from '@shared/config/brand'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const {
    resetPassword,
    isResetting,
    resetPasswordData,
    resetPasswordError,
  } = useAuth()
  const { isMobile } = useBreakpoint()

  const inputClass = "w-full h-12 px-4 bg-[var(--surface)] border border-transparent rounded-[var(--r-sm)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] transition-all duration-[var(--d-fast)] ease-[var(--ease-out)] focus:outline-none focus:bg-[var(--bg-elevated)] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)]"

  const getStrength = (pw: string): number => {
    if (!pw) return 0
    if (pw.length <= 3) return 1
    if (pw.length <= 5) return 2
    if (pw.length <= 7) return 3
    return 4
  }

  const strength = getStrength(newPassword)

  const strengthSegments = [0, 1, 2, 3].map((i) => {
    if (i >= strength) return '#E5E3DF'
    if (strength === 1) return 'var(--warm-red)'
    if (strength === 2) return 'var(--warm-yellow)'
    if (strength === 3) return i < 2 ? 'var(--warm-yellow)' : 'var(--leaf)'
    return 'var(--leaf)'
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError('')

    if (newPassword.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden')
      return
    }

    try {
      await resetPassword({ token: token!, new_password: newPassword, confirm_password: confirmPassword })
    } catch {
      // error handled via resetPasswordError
    }
  }

  const errorContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--warm-red)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Enlace Inválido
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        El enlace de recuperación es inválido o ha expirado.
      </p>
      <Link
        to="/forgot-password"
        className="block w-full h-12 leading-[48px] text-center rounded-[var(--r-pill)] bg-[var(--brand)] text-white font-medium text-sm shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] transition-all duration-[var(--d-fast)]"
      >
        Solicitar nuevo enlace
      </Link>
    </>
  )

  const successContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--leaf)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Contraseña Restablecida
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        Tu contraseña fue restablecida exitosamente.
      </p>
      <Link
        to="/login"
        className="block w-full h-12 leading-[48px] text-center rounded-[var(--r-pill)] bg-[var(--brand)] text-white font-medium text-sm shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] transition-all duration-[var(--d-fast)]"
      >
        Iniciar Sesión
      </Link>
    </>
  )

  const formContent = (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] flex items-center justify-center shadow-[var(--shadow-brand)]">
          <span className="text-white text-2xl font-bold leading-none">{CONFIG.logoChar}</span>
        </div>
        <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] tracking-[-0.02em] mb-1">
          Restablecer Contraseña
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass + ' pr-20'}
              placeholder="Nueva contraseña"
              disabled={isResetting}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink-2)]"
            >
              {showNewPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {newPassword && (
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
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass + ' pr-20'}
              placeholder="Confirmar contraseña"
              disabled={isResetting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--ink-3)] hover:text-[var(--ink-2)]"
            >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {(validationError || resetPasswordError) && (
          <p className="text-xs" style={{ color: 'var(--warm-red)' }}>
            {validationError || (resetPasswordError instanceof Error ? resetPasswordError.message : 'Error al restablecer la contraseña')}
          </p>
        )}

        <button
          type="submit"
          disabled={isResetting}
          className="btn btn-primary btn-lg w-full"
        >
          {isResetting && (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="white" opacity="0.75" />
            </svg>
          )}
          Restablecer Contraseña
        </button>
      </form>
    </>
  )

  let content
  if (!token) {
    content = errorContent
  } else if (resetPasswordData) {
    content = successContent
  } else {
    content = formContent
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[var(--bg-elevated)] p-6 flex flex-col justify-center" style={{ fontFamily: 'var(--ff-body)' }}>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative flex items-center justify-center p-4" style={{ fontFamily: 'var(--ff-body)' }}>
      <div className="ambient" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[6px]" />
      <div
        className="relative w-full max-w-[420px] bg-[var(--bg-elevated)] rounded-[var(--r-lg)] p-9 shadow-[var(--shadow-float)]"
        style={{ animation: 'float-up 350ms var(--ease-spring)' }}
      >
        {content}
      </div>
    </div>
  )
}

export default ResetPasswordPage
