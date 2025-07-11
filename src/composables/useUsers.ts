import { ServerAxiosConfig } from '@/constant/axios-config'
import type { User } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import axios from 'axios'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

export function useUsers() {
  const query = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}users`)
      return response.data
    },
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch users')
    }
  })

  return {
    ...query,
    users: query.data,
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: Omit<User, 'id'>) => {
      const response = await axios.post(`${ServerAxiosConfig.baseURL}users`, userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: () => {
      toast.error('Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...userData }: User) => {
      const response = await axios.put(`${ServerAxiosConfig.baseURL}users/${id}`, userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
    },
    onError: () => {
      toast.error('Failed to update user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      await axios.delete(`${ServerAxiosConfig.baseURL}users/${userId}`)
      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete user')
    },
  })
}
