import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_PREFIX } from '../config/constants'

// ── API Client Instance ──────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Token Refresh Retry Queue ────────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests
// fail with 401 at the same time.

interface QueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

// ── Request Interceptor ──────────────────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Dynamic import to avoid circular dependency (stores → client → stores)
    const { useAuthStore } = await import('../stores/authStore')
    const token = useAuthStore.getState().accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor (Token Refresh) ────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only attempt refresh on 401 errors that aren't already retries
    // and aren't auth endpoints themselves (avoid infinite loops)
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { useAuthStore } = await import('../stores/authStore')
      const store = useAuthStore.getState()

      await store.refreshTokens()

      const newToken = useAuthStore.getState().accessToken

      if (!newToken) {
        throw new Error('Token refresh returned no token')
      }

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      // Clear auth and redirect to login
      const { useAuthStore } = await import('../stores/authStore')
      useAuthStore.getState().clearAuth()

      window.location.href = '/login'

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
