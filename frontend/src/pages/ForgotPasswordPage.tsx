import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { CONFIG } from '@shared/config/brand'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { forgotPassword, isSendingReset, forgotPasswordData, forgotPasswordError } = useAuth()
  const { isMobile } = useBreakpoint()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await forgotPassword({ email })
      setSubmitted(true)
    } catch {
      // error handled via forgotPasswordError
    }
  }

  const showSuccess = forgotPasswordData || submitted

  const inputClass = "w-full h-12 px-4 bg-[var(--surface)] border border-transparent rounded-[var(--r-sm)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] transition-all duration-[var(--d-fast)] ease-[var(--ease-out)] focus:outline-none focus:bg-[var(--bg-elevated)] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)]"

  const successContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--leaf)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Correo Enviado
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        Si el email existe, recibirás un enlace de recuperación.
      </p>
      <Link
        to="/login"
        className="block w-full h-12 leading-[48px] text-center rounded-[var(--r-pill)] bg-[var(--brand)] text-white font-medium text-sm shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] transition-all duration-[var(--d-fast)]"
      >
        Volver a Iniciar Sesión
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
          Recuperar Contraseña
        </h1>
      </div>

      <div className="mb-6 p-4 rounded-sm text-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand-ink)' }}>
        Te enviaremos un enlace para restablecer tu contraseña.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="tu@email.com"
          />
        </div>
        {forgotPasswordError && (
          <p className="text-xs" style={{ color: 'var(--warm-red)' }}>
            {forgotPasswordError instanceof Error ? forgotPasswordError.message : 'Error al enviar el enlace'}
          </p>
        )}
        <button
          type="submit"
          disabled={isSendingReset}
          className="btn btn-primary btn-lg w-full"
        >
          {isSendingReset && (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="white" opacity="0.75" />
            </svg>
          )}
          Enviar Enlace
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>
          ← Volver al login
        </Link>
      </p>
    </>
  )

  const content = showSuccess ? successContent : formContent

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

export default ForgotPasswordPage
