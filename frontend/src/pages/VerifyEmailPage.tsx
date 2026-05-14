import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { CONFIG } from '@shared/config/brand'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [email, setEmail] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [verified, setVerified] = useState(false)

  const {
    verifyEmail,
    isVerifying,
    verifyEmailData,
    verifyEmailError,
    sendVerification,
    isSendingVerification,
  } = useAuth()
  const { isMobile } = useBreakpoint()

  const inputClass = "w-full h-12 px-4 bg-[var(--surface)] border border-transparent rounded-[var(--r-sm)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] transition-all duration-[var(--d-fast)] ease-[var(--ease-out)] focus:outline-none focus:bg-[var(--bg-elevated)] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)]"

  useEffect(() => {
    if (token) {
      verifyEmail({ token })
        .then(() => setVerified(true))
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verifyingContent = (
    <div className="text-center py-8">
      <div className="w-10 h-10 mx-auto mb-6 rounded-full border-3 border-[var(--brand)] border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Verificando Email
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center">
        Por favor espera mientras verificamos tu email...
      </p>
    </div>
  )

  const verifiedContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--leaf)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Email Verificado
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        Tu email fue verificado exitosamente.
      </p>
      <Link
        to="/login"
        className="block w-full h-12 leading-[48px] text-center rounded-[var(--r-pill)] bg-[var(--brand)] text-white font-medium text-sm shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] transition-all duration-[var(--d-fast)]"
      >
        Iniciar Sesión
      </Link>
    </>
  )

  const errorContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--warm-red)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Error de Verificación
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        {verifyEmailError instanceof Error ? verifyEmailError.message : 'El enlace de verificación es inválido o ha expirado.'}
      </p>
      <Link
        to="/verify-email"
        className="block w-full h-12 leading-[48px] text-center rounded-[var(--r-pill)] bg-[var(--brand)] text-white font-medium text-sm shadow-[var(--shadow-brand)] hover:bg-[var(--brand-hover)] transition-all duration-[var(--d-fast)]"
      >
        Reenviar verificación
      </Link>
    </>
  )

  const sendSuccessContent = (
    <>
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--leaf)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-[var(--ink-1)] text-[22px] font-semibold font-[var(--ff-display)] text-center mb-2">
        Verificación Enviada
      </h1>
      <p className="text-sm text-[var(--ink-3)] text-center mb-6">
        Si el email existe, recibirás un enlace de verificación.
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
          Verificar Email
        </h1>
        <p className="text-sm text-[var(--ink-3)]">
          Ingresá tu email para recibir un enlace de verificación.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendVerification({ email })
            .then(() => setSendSuccess(true))
            .catch(() => {})
        }}
        className="space-y-4"
      >
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
        <button
          type="submit"
          disabled={isSendingVerification}
          className="btn btn-primary btn-lg w-full"
        >
          {isSendingVerification && (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="white" opacity="0.75" />
            </svg>
          )}
          Enviar Verificación
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--brand)' }}>
          ← Volver a Iniciar Sesión
        </Link>
      </p>
    </>
  )

  let content
  if (token && isVerifying) {
    content = verifyingContent
  } else if (token && (verifyEmailData || verified)) {
    content = verifiedContent
  } else if (token && verifyEmailError) {
    content = errorContent
  } else if (sendSuccess) {
    content = sendSuccessContent
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

export default VerifyEmailPage
