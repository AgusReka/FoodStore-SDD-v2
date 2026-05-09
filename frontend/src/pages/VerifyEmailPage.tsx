import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'

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

  useEffect(() => {
    if (token) {
      verifyEmail({ token })
        .then(() => setVerified(true))
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (token) {
    if (isVerifying) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verificando Email
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu email...
            </p>
          </div>
        </div>
      )
    }

    if (verifyEmailData || verified) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verificado
            </h1>
            <p className="text-gray-600 mb-6">
              Email verificado exitosamente.
            </p>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      )
    }

    if (verifyEmailError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error de Verificación
            </h1>
            <p className="text-gray-600 mb-6">
              {verifyEmailError.message || 'El enlace de verificación es inválido o ha expirado.'}
            </p>
            <Link
              to="/verify-email"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Reenviar verificación
            </Link>
          </div>
        </div>
      )
    }
  }

  if (sendSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verificación Enviada
          </h1>
          <p className="text-gray-600 mb-6">
            Si el email existe, recibirás un enlace de verificación.
          </p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Verificar Email
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6 text-sm">
            Ingresa tu email para recibir un enlace de verificación.
          </p>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingVerification}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingVerification ? 'Enviando...' : 'Enviar Verificación'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Volver a Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
