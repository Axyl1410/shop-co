import { ServerAxiosConfig } from '@/constant/axios-config'
import type { Product } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import axios from 'axios'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

export function useProducts() {
  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}product`)
      return response.data
    },
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch products')
    }
  })

  return {
    ...query,
    products: query.data,
  }
}

export function useProduct(productId: number) {
  const query = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}product/${productId}`)
      return response.data
    },
    enabled: !!productId,
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch product')
    }
  })

  return {
    ...query,
    product: query.data,
  }
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id'>) => {
      const response = await axios.post(`${ServerAxiosConfig.baseURL}product`, productData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: () => {
      toast.error('Failed to create product')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...productData }: Product) => {
      const response = await axios.put(`${ServerAxiosConfig.baseURL}product/${id}`, productData)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      toast.success('Product updated successfully')
    },
    onError: () => {
      toast.error('Failed to update product')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number) => {
      await axios.delete(`${ServerAxiosConfig.baseURL}product/${productId}`)
      return productId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })
}
