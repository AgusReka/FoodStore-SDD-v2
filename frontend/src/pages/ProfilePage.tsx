import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import ChangePasswordForm from '@features/auth/ChangePasswordForm'

const ProfilePage = () => {
  const navigate = useNavigate()
  const {
    user,
    isLoading,
    isSendingVerification,
    sendVerification,
    sendVerificationData,
    logout,
  } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--brand)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Información Personal
        </h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-gray-500">Nombre</dt>
            <dd className="text-gray-900 font-medium">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900 font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Usuario</dt>
            <dd className="text-gray-900 font-medium">{user.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Rol</dt>
            <dd className="text-gray-900 font-medium capitalize">{user.role}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-gray-500">Email Verificado</dt>
            <dd>
              {user.is_verified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verificado
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                  <button
                    onClick={() => sendVerification({ email: user.email })}
                    disabled={isSendingVerification}
                    className="text-sm text-[var(--brand)] hover:text-[var(--brand-hover)] disabled:text-gray-400"
                  >
                    {isSendingVerification ? 'Enviando...' : 'Verificar Email'}
                  </button>
                </div>
              )}
              {sendVerificationData && (
                <p className="text-sm text-green-600 mt-1">
                  {sendVerificationData.message}
                </p>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ChangePasswordForm />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Historial de Pedidos
        </h2>
        <Link
          to="/orders"
          className="inline-block text-[var(--brand)] hover:text-[var(--brand-hover)] font-medium"
        >
          Ver mis pedidos &rarr;
        </Link>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
