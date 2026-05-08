import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { post } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

interface UserRead {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  is_verified: boolean
  role: 'admin' | 'cliente'
  created_at: string
  updated_at?: string | null
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserRead | null
  isLoading: boolean
  hasError: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
  setUser: (user: UserRead) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      hasError: false,

      login: async (email, password) => {
        set({ isLoading: true, hasError: false })
        try {
          const response = await post<LoginResponse>(ENDPOINTS.AUTH_LOGIN, { email, password })
          const { access_token, refresh_token } = response.data
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          if (refreshToken) {
            await post(ENDPOINTS.AUTH_LOGOUT, { refresh_token: refreshToken })
          }
        } catch {
          // Even if the server request fails, clear local state
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            hasError: false,
          })
        }
      },

      refreshTokens: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        try {
          const response = await post<LoginResponse>(ENDPOINTS.AUTH_REFRESH, {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token } = response.data
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
          })
        } catch (error) {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
          })
          throw error
        }
      },

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoading: false,
          hasError: false,
        }),
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
