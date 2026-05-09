import { useNavigate } from 'react-router-dom'
import RegisterForm from '@features/auth/RegisterForm'

const RegisterPage = () => {
  const navigate = useNavigate()

  const handleRegisterSuccess = (email: string) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : ''
    navigate(`/login${query}`, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Crear Cuenta
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
