import { ServerAxiosConfig } from "@/constant";
import { AuthService } from "@/services/auth-service";
import type { Review, ProductVariant, Order, OrderItem } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import axios from "axios";
import { toast } from "vue-sonner";

export function useReviews(productId: string) {
  const queryClient = useQueryClient();

  // Fetch reviews
  const reviewsQuery = useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      // Get all reviews and filter by productId
      const response = await axios(`${ServerAxiosConfig.baseURL}/reviews`);
      const allReviews = response.data;
      // Filter reviews by productId, handling both string and number types
      return allReviews.filter((review: Review) => 
        review.productId.toString() === productId.toString()
      );
    },
    enabled: !!productId,
  });

  // Fetch user orders to check review eligibility and purchased variants
  const canReviewQuery = useQuery<{
    canReview: boolean;
    purchasedVariants: ProductVariant[];
    orderId?: string;
  }>({
    queryKey: ["canReview", productId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return { canReview: false, purchasedVariants: [] };

      const currentUser = await AuthService.getCurrentUser(token);
      if (!currentUser) return { canReview: false, purchasedVariants: [] };

      // Get orders for current user
      const ordersResponse = await axios.get(`${ServerAxiosConfig.baseURL}/orders?userId=${currentUser.id}`);
      const orders = ordersResponse.data as Order[];

      // Get order items for these orders
      const orderItemsResponse = await axios.get(`${ServerAxiosConfig.baseURL}/order_items`);
      const allOrderItems = orderItemsResponse.data as OrderItem[];

      const purchasedVariants: ProductVariant[] = [];
      let canReview = false;
      let orderId: string | undefined;

      // Check if user has purchased this product
      for (const order of orders) {
        const orderItems = allOrderItems.filter(item => item.orderId.toString() === order.id.toString());
        
        for (const item of orderItems) {
          // We need to get the productId from the product variant
          // Since order items don't have productId directly, we need to fetch product variants
          const variantResponse = await axios.get(`${ServerAxiosConfig.baseURL}/product_variants/${item.productVariantId}`);
          const variant = variantResponse.data;
          
          if (variant && variant.productId.toString() === productId) {
            canReview = true;
            orderId = order.id;
            
            // Create variant info from order item and variant data
            const purchasedVariant: ProductVariant = {
              id: item.productVariantId,
              name: `${item.color}, ${item.size}`,
              productId: variant.productId,
              size: item.size,
              color: item.color,
              colorCode: variant.colorCode || "#000000",
              sku: item.productSku,
              salePrice: item.unitPrice,
              stockQuantity: 0, // Not relevant for purchased items
            };
            
            purchasedVariants.push(purchasedVariant);
          }
        }
      }

      return { canReview, purchasedVariants, orderId };
    },
    enabled: !!productId,
  });

  const canReview = computed(() => canReviewQuery.data.value?.canReview ?? false);
  const purchasedVariants = computed(() => canReviewQuery.data.value?.purchasedVariants ?? []);
  const orderId = computed(() => canReviewQuery.data.value?.orderId);

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (
      newReview: Omit<Review, "id" | "createdAt"> & { images?: string[]; variantId?: number }
    ) => {
      if (!canReview.value) {
        throw new Error("Bạn phải mua sản phẩm này mới có thể review");
      }

      if (newReview.variantId && !purchasedVariants.value.some((v) => v.id === newReview.variantId)) {
        throw new Error("Bạn chỉ có thể đánh giá phân loại sản phẩm đã mua");
      }

      const selectedVariant = purchasedVariants.value.find((v) => v.id === newReview.variantId);
      const variantName = selectedVariant ? selectedVariant.name : undefined;

      const payload = {
        productId: productId,
        userId: newReview.userId,
        orderId: newReview.orderId,
        rating: newReview.rating,
        title: newReview.title,
        content: newReview.content,
        images: newReview.images || [],
        createdAt: new Date().toISOString(),
        variantId: newReview.variantId || undefined,
        variantName: variantName || "",
        color: selectedVariant?.color || "",
        size: selectedVariant?.size || "",
        isVerified: true,
        isHelpful: 0,
      };

      // Create review directly in reviews collection
      const res = await axios.post(`${ServerAxiosConfig.baseURL}/reviews`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["canReview", productId] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to submit review");
    },
  });

  // Reply review mutation
  const replyReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      const res = await axios.patch(`${ServerAxiosConfig.baseURL}/reviews/${reviewId}/reply`, {
        reply,
        replyDate: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đã trả lời review");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Trả lời thất bại");
    },
  });

  return {
    reviews: reviewsQuery.data,
    isLoadingReviews: reviewsQuery.isLoading,
    canReview,
    purchasedVariants,
    orderId,
    isCheckingReviewPermission: canReviewQuery.isLoading,
    createReview: createReviewMutation.mutate,
    isSubmittingReview: createReviewMutation.isPending,
    replyReview: replyReviewMutation.mutate,
    isReplying: replyReviewMutation.isPending,
  };
}