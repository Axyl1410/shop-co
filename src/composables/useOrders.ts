import { ServerAxiosConfig } from '@/constant/axios-config'
import type { Order } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import axios from 'axios'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

export function useOrders() {
  const query = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}orders`)
      return response.data
    },
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch orders')
    }
  })

  return {
    ...query,
    orders: query.data,
  }
}

export function useUserOrders(userId: number) {
  const query = useQuery<Order[]>({
    queryKey: ['user-orders', userId],
    queryFn: async (): Promise<Order[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}orders?userId=${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch user orders')
    }
  })

  return {
    ...query,
    orders: query.data,
  }
}

export function useOrder(orderId: number) {
  const query = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}orders/${orderId}`)
      return response.data
    },
    enabled: !!orderId,
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch order')
    }
  })

  return {
    ...query,
    order: query.data,
  }
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'id'>) => {
      const response = await axios.post(`${ServerAxiosConfig.baseURL}orders`, orderData)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['user-orders', data.userId] })
      toast.success('Order created successfully')
    },
    onError: () => {
      toast.error('Failed to create order')
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...orderData }: Order) => {
      const response = await axios.put(`${ServerAxiosConfig.baseURL}orders/${id}`, orderData)
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user-orders', data.userId] })
      toast.success('Order updated successfully')
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number) => {
      await axios.delete(`${ServerAxiosConfig.baseURL}orders/${orderId}`)
      return orderId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete order')
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: Order['status'] }) => {
      const response = await axios.patch(`${ServerAxiosConfig.baseURL}orders/${orderId}/status`, {
        status,
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      queryClient.invalidateQueries({ queryKey: ['user-orders', data.userId] })
      toast.success('Order status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update order status')
    },
  })
}
