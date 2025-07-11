import { ServerAxiosConfig } from '@/constant/axios-config'
import type { Review } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import axios from 'axios'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

export function useReviews() {
  const query = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async (): Promise<Review[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}review`)
      return response.data
    },
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch reviews')
    }
  })

  return {
    ...query,
    reviews: query.data,
  }
}

export function useProductReviews(productId: number) {
  const query = useQuery<Review[]>({
    queryKey: ['product-reviews', productId],
    queryFn: async (): Promise<Review[]> => {
      const response = await axios(`${ServerAxiosConfig.baseURL}review?productId=${productId}`)
      return response.data
    },
    enabled: !!productId,
  })

  watch([query.isError], ([newIsError]) => {
    if (newIsError) {
      toast.error('Failed to fetch product reviews')
    }
  })

  return {
    ...query,
    reviews: query.data,
  }
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewData: Omit<Review, 'id'>) => {
      const response = await axios.post(`${ServerAxiosConfig.baseURL}review`, reviewData)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.productId] })
      toast.success('Review created successfully')
    },
    onError: () => {
      toast.error('Failed to create review')
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...reviewData }: Review) => {
      const response = await axios.put(`${ServerAxiosConfig.baseURL}review/${id}`, reviewData)
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['product-reviews', variables.productId] })
      toast.success('Review updated successfully')
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: number) => {
      await axios.delete(`${ServerAxiosConfig.baseURL}review/${reviewId}`)
      return reviewId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete review')
    },
  })
}

// Special mutation for creating product review
export function useCreateProductReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
      user,
      content,
      rating,
      size,
      color,
    }: {
      productId: number
      userId: number
      user: string
      content: string
      rating: number
      size: string
      color: string
    }) => {
      const reviewData = {
        productId,
        userId,
        user,
        content,
        rating,
        date: new Date().toISOString().split('T')[0],
        size,
        color,
      }

      const response = await axios.post(`${ServerAxiosConfig.baseURL}review`, reviewData)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.productId] })
      toast.success('Review submitted successfully')
    },
    onError: () => {
      toast.error('Failed to submit review')
    },
  })
}
