import { useAuth } from '@shared/hooks/useAuth'

const AdminPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Panel de Administración
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            Bienvenido, <span className="font-semibold text-gray-900">{user?.first_name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Panel en construcción — próximamente podrás gestionar usuarios, productos y pedidos desde aquí.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
