import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { post, put, get as apiGet } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useCartStore } from './cartStore'

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

interface RegisterData {
  email: string
  username: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

interface ResetPasswordData {
  token: string
  new_password: string
  confirm_password: string
}

interface ChangePasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserRead | null
  isLoading: boolean
  profileLoading: boolean
  hasError: boolean

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
  fetchProfile: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  sendVerification: (email: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
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
      profileLoading: false,
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
            profileLoading: true,
          })
          // Fetch user profile immediately so it's ready for ProtectedRoute
          await get().fetchProfile()
        } catch (error) {
          set({ isLoading: false, hasError: true, profileLoading: false })
          throw error
        }
      },

      fetchProfile: async () => {
        const { accessToken } = get()
        if (!accessToken) return
        set({ profileLoading: true })
        try {
          const response = await apiGet<UserRead>(ENDPOINTS.AUTH_ME)
          set({ user: response.data, profileLoading: false })
        } catch {
          set({ profileLoading: false })
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
          useCartStore.getState().clearCart()
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

      register: async (data) => {
        set({ isLoading: true, hasError: false })
        try {
          await post(ENDPOINTS.AUTH_REGISTER, data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, hasError: false })
        try {
          await post(ENDPOINTS.AUTH_FORGOT_PASSWORD, { email })
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      resetPassword: async (data) => {
        set({ isLoading: true, hasError: false })
        try {
          await post(ENDPOINTS.AUTH_RESET_PASSWORD, data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      sendVerification: async (email) => {
        set({ isLoading: true, hasError: false })
        try {
          await post(ENDPOINTS.AUTH_SEND_VERIFICATION, { email })
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, hasError: false })
        try {
          await post(ENDPOINTS.AUTH_VERIFY_EMAIL, { token })
          // Update user's is_verified if user is loaded
          const user = get().user
          if (user) {
            set({ user: { ...user, is_verified: true } })
          }
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
          throw error
        }
      },

      changePassword: async (data) => {
        set({ isLoading: true, hasError: false })
        try {
          await put(ENDPOINTS.AUTH_CHANGE_PASSWORD, data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false, hasError: true })
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
