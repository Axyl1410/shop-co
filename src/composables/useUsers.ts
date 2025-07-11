import { ServerAxiosConfig } from '@/constant/axios-config'
import type { User } from '@/types'
import { useQuery } from '@tanstack/vue-query'
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
