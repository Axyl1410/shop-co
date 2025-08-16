import { ProductService } from "@/services/product-service";
import type { ProductVariant } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useProductVariants(productId?: number) {
	const queryClient = useQueryClient();

	const query = useQuery<ProductVariant[]>({
		queryKey: ["product-variants", productId],
		queryFn: () => (productId ? ProductService.getProductVariants(productId) : Promise.resolve([])),
		enabled: !!productId,
	});

	const createVariantMutation = useMutation({
		mutationFn: ProductService.createProductVariant,
		onSuccess: () => {
			if (productId) {
				queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
			}
			toast.success("Product variant created successfully");
		},
		onError: () => {
			toast.error("Failed to create product variant");
		},
	});

	const updateVariantMutation = useMutation({
		mutationFn: ({ id, variant }: { id: number; variant: Partial<ProductVariant> }) =>
			ProductService.updateProductVariant(id, variant),
		onSuccess: () => {
			if (productId) {
				queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
			}
			toast.success("Product variant updated successfully");
		},
		onError: () => {
			toast.error("Failed to update product variant");
		},
	});

	const deleteVariantMutation = useMutation({
		mutationFn: ProductService.deleteProductVariant,
		onSuccess: () => {
			if (productId) {
				queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
			}
			toast.success("Product variant deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete product variant");
		},
	});

	return {
		...query,
		variants: query.data,
		createVariant: createVariantMutation.mutate,
		updateVariant: updateVariantMutation.mutate,
		deleteVariant: deleteVariantMutation.mutate,
		isCreating: createVariantMutation.isPending,
		isUpdating: updateVariantMutation.isPending,
		isDeleting: deleteVariantMutation.isPending,
	};
}
