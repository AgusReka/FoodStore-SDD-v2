import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { get, post, put } from '../api/client'
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

interface RegisterData {
  email: string
  username: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  new_password: string
  confirm_password: string
}

interface SendVerificationData {
  email: string
}

interface VerifyEmailData {
  token: string
}

interface ChangePasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const storeUser = useAuthStore((s) => s.user)
  const storeLoading = useAuthStore((s) => s.isLoading)
  const storeLogin = useAuthStore((s) => s.login)
  const storeLogout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)

  const isAuthenticated = !!accessToken

  const {
    data: fetchedUser,
    isLoading: profileLoading,
    refetch: refreshProfile,
  } = useQuery<UserRead>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await get<UserRead>(ENDPOINTS.AUTH_ME)
      return response.data
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser)
    }
  }, [fetchedUser, setUser])

  const registerMutation = useMutation<UserRead, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await post<UserRead>(ENDPOINTS.AUTH_REGISTER, data)
      return response.data
    },
  })

  const forgotPasswordMutation = useMutation<{ message: string }, Error, ForgotPasswordData>({
    mutationFn: async (data) => {
      const response = await post<{ message: string }>(ENDPOINTS.AUTH_FORGOT_PASSWORD, data)
      return response.data
    },
  })

  const resetPasswordMutation = useMutation<{ message: string }, Error, ResetPasswordData>({
    mutationFn: async (data) => {
      const response = await post<{ message: string }>(ENDPOINTS.AUTH_RESET_PASSWORD, data)
      return response.data
    },
  })

  const sendVerificationMutation = useMutation<{ message: string }, Error, SendVerificationData>({
    mutationFn: async (data) => {
      const response = await post<{ message: string }>(ENDPOINTS.AUTH_SEND_VERIFICATION, data)
      return response.data
    },
  })

  const verifyEmailMutation = useMutation<{ message: string }, Error, VerifyEmailData>({
    mutationFn: async (data) => {
      const response = await post<{ message: string }>(ENDPOINTS.AUTH_VERIFY_EMAIL, data)
      return response.data
    },
  })

  const changePasswordMutation = useMutation<{ message: string }, Error, ChangePasswordData>({
    mutationFn: async (data) => {
      const response = await put<{ message: string }>(ENDPOINTS.AUTH_CHANGE_PASSWORD, data)
      return response.data
    },
  })

  return {
    user: storeUser,
    isAuthenticated,
    isLoading: storeLoading || profileLoading,
    login: storeLogin,
    logout: storeLogout,
    register: registerMutation.mutateAsync,
    refreshProfile,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingReset: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error,
    forgotPasswordData: forgotPasswordMutation.data,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,
    resetPasswordData: resetPasswordMutation.data,
    sendVerification: sendVerificationMutation.mutateAsync,
    isSendingVerification: sendVerificationMutation.isPending,
    sendVerificationData: sendVerificationMutation.data,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isVerifying: verifyEmailMutation.isPending,
    verifyEmailError: verifyEmailMutation.error,
    verifyEmailData: verifyEmailMutation.data,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
    changePasswordData: changePasswordMutation.data,
  }
}
