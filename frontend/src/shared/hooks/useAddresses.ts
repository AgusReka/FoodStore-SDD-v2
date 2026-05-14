import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, del } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'

export interface Address {
  id: string
  street: string
  street_number: string
  city: string
  postal_code: string
  is_primary: boolean
}

export function useAddressesList() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await get<{ items: Address[] }>(ENDPOINTS.ADDRESSES_LIST)
      return res.data?.items ?? res.data ?? []
    },
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Address, 'id'>) => {
      const res = await post<Address>(ENDPOINTS.ADDRESSES_CREATE, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await del(ENDPOINTS.ADDRESSES_DELETE(id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}
