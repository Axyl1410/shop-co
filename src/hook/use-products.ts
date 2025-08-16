import { ProductService } from "@/services/product-service";
import type { Product } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export function useProducts() {
	const queryClient = useQueryClient();

	const query = useQuery<Product[]>({
		queryKey: ["products"],
		queryFn: ProductService.getAllProducts,
	});

	const createProductMutation = useMutation({
		mutationFn: ProductService.createProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product created successfully");
		},
		onError: () => {
			toast.error("Failed to create product");
		},
	});

	const updateProductMutation = useMutation({
		mutationFn: ({ id, product }: { id: number; product: Partial<Product> }) =>
			ProductService.updateProduct(id, product),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product updated successfully");
		},
		onError: () => {
			toast.error("Failed to update product");
		},
	});

	const deleteProductMutation = useMutation({
		mutationFn: ProductService.deleteProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete product");
		},
	});

	const activateProductMutation = useMutation({
		mutationFn: ProductService.activateProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product activated successfully");
		},
		onError: () => {
			toast.error("Failed to activate product");
		},
	});

	return {
		...query,
		products: query.data,
		createProduct: createProductMutation.mutate,
		updateProduct: updateProductMutation.mutate,
		deleteProduct: deleteProductMutation.mutate,
		activateProduct: activateProductMutation.mutate,
		isCreating: createProductMutation.isPending,
		isUpdating: updateProductMutation.isPending,
		isDeleting: deleteProductMutation.isPending,
		isActivating: activateProductMutation.isPending,
	};
}
