import { useEffect, useState } from 'react'
import apiClient from '@shared/api/axios'

const HomePage = () => {
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    // Test API connection
    apiClient.get('/')
      .then(res => setStatus(`API OK: ${res.status}`))
      .catch(err => setStatus(`API Error: ${err.message}`))
  }, [])

  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold">Welcome to Food Store</h1>
      <p className="mt-4 text-gray-200">{status || 'Checking API...'}</p>
      <p className="mt-2 text-gray-300">Your favorite food delivery app.</p>
    </div>
  )
}

export default HomePage
