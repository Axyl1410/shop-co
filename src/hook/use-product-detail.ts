import { ServerAxiosConfig } from "@/constant";
import type { Product, ProductVariant, Review } from "@/types";
import type { Category } from "@/types/category";
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { computed } from "vue";
import { toast } from "vue-sonner";

interface ProductDetailData {
	product: Product;
	variants: ProductVariant[];
	category: Category;
	reviews: Review[];
	relatedProducts: Product[];
}

export function useProductDetail(productId: string | number) {
	const query = useQuery<ProductDetailData>({
		queryKey: ["product-detail", productId],
		queryFn: async (): Promise<ProductDetailData> => {
			try {
				console.log("Fetching product detail for ID:", productId);

				// Add fallback baseURL if not defined
				const baseURL = ServerAxiosConfig.baseURL || "http://localhost:3000";
				console.log("Using baseURL:", baseURL);

				// Fetch all data from the JSON server
				const [productsResponse, variantsResponse, categoriesResponse, reviewsResponse] =
					await Promise.all([
						axios(`${baseURL}/products`),
						axios(`${baseURL}/product_variants`),
						axios(`${baseURL}/categories`),
						axios(`${baseURL}/reviews`),
					]);

				const products: Product[] = productsResponse.data;
				const variants: ProductVariant[] = variantsResponse.data;
				const categories: Category[] = categoriesResponse.data;
				const reviews: Review[] = reviewsResponse.data;

				console.log("Fetched data:", {
					productsCount: products.length,
					variantsCount: variants.length,
					categoriesCount: categories.length,
					reviewsCount: reviews.length,
				});

				// Find the specific product
				const product = products.find((p) => String(p.id) === String(productId));
				if (!product) {
					throw new Error("Product not found");
				}

				console.log("Found product:", product);

				// Get product variants
				const productVariants = variants.filter((v) => String(v.productId) === String(product.id));
				console.log("Product variants:", productVariants);

				// Get category information
				const category = categories.find((c) => c.id === product.categoryId);

				// Get product reviews
				const productReviews = reviews.filter((r) => String(r.productId) === String(product.id));

				// Get related products (same category, excluding current product)
				const relatedProducts = products
					.filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
					.slice(0, 4);

				return {
					product,
					variants: productVariants,
					category: category!,
					reviews: productReviews,
					relatedProducts,
				};
			} catch (error) {
				console.error("Error fetching product detail:", error);
				throw error;
			}
		},
		enabled: !!productId,
	});

	// Computed properties for easier access
	const product = computed(() => query.data.value?.product);
	const variants = computed(() => query.data.value?.variants || []);
	const category = computed(() => query.data.value?.category);
	const reviews = computed(() => query.data.value?.reviews || []);
	const relatedProducts = computed(() => query.data.value?.relatedProducts || []);

	// Helper functions - optimized and simplified
	const getAvailableColors = computed(() => {
		if (!variants.value.length) return [];

		// Get unique colors from variants that have stock > 0
		const availableColors = new Map();
		variants.value.forEach((variant: ProductVariant) => {
			if (variant.stockQuantity > 0 && !availableColors.has(variant.colorCode)) {
				availableColors.set(variant.colorCode, {
					name: variant.color,
					code: variant.colorCode,
					available: true,
				});
			}
		});

		return Array.from(availableColors.values());
	});

	const getAvailableSizes = computed(() => {
		if (!variants.value.length) return [];

		// Get unique sizes from variants that have stock > 0
		const availableSizes = new Set<string>();
		variants.value.forEach((variant: ProductVariant) => {
			if (variant.stockQuantity > 0) {
				availableSizes.add(variant.size);
			}
		});

		return Array.from(availableSizes).sort();
	});

	const getVariantByColorAndSize = (colorName: string, size: string) => {
		return variants.value.find(
			(variant: ProductVariant) => variant.color === colorName && variant.size === size,
		);
	};

	const getStockQuantity = (colorName: string, size: string) => {
		const variant = getVariantByColorAndSize(colorName, size);
		return variant?.stockQuantity || 0;
	};

	const isVariantAvailable = (colorName: string, size: string) => {
		const stock = getStockQuantity(colorName, size);
		return stock > 0;
	};

	const getAverageRating = computed(() => {
		if (reviews.value.length === 0) return 0;
		const totalRating = reviews.value.reduce(
			(sum: number, review: Review) => sum + review.rating,
			0,
		);
		return totalRating / reviews.value.length;
	});

	const getReviewCount = computed(() => {
		return reviews.value.length;
	});

	// Error handling
	if (query.isError.value) {
		toast.error("Failed to fetch product details");
	}

	return {
		// Query state
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,

		// Data
		product,
		variants,
		category,
		reviews,
		relatedProducts,

		// Helper computed properties
		getAvailableColors,
		getAvailableSizes,
		getVariantByColorAndSize,
		getStockQuantity,
		isVariantAvailable,
		getAverageRating,
		getReviewCount,

		// Refetch function
		refetch: query.refetch,
	};
}
