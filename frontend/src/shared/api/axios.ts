import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor for auth token injection
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Replace with actual Zustand store access in auth-frontend change
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Implement token refresh logic in auth-frontend change
      console.warn('Unauthorized request - token refresh needed')
    }
    return Promise.reject(error)
  }
)

export default apiClient
