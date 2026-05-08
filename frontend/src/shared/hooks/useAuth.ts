import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { get, post } from '../api/client'
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
  }
}
