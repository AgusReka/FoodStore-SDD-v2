import { useAuth } from '@shared/hooks/useAuth'

const AdminDashboard = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">
          Bienvenido, <span className="font-semibold text-gray-900">{user?.first_name}</span>
        </p>
        <p className="text-sm text-gray-500">
          Panel de administración — gestiona usuarios, categorías, productos y pedidos desde aquí.
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard
