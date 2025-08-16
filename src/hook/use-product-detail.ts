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
				// Add fallback baseURL if not defined
				const baseURL = ServerAxiosConfig.baseURL || "http://localhost:3000";

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
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 3,
	});

	// Computed properties for easier access
	const product = computed(() => query.data.value?.product);
	const variants = computed(() => query.data.value?.variants || []);
	const category = computed(() => query.data.value?.category);
	const reviews = computed(() => query.data.value?.reviews || []);
	const relatedProducts = computed(() => query.data.value?.relatedProducts || []);

	// Helper functions - improved logic
	const getAvailableColors = computed(() => {
		if (!variants.value.length) return [];

		// Get all unique colors from variants, regardless of stock
		const colorMap = new Map();
		variants.value.forEach((variant: ProductVariant) => {
			if (!colorMap.has(variant.colorCode)) {
				colorMap.set(variant.colorCode, {
					name: variant.color,
					code: variant.colorCode,
					hasStock: false, // Will be updated below
				});
			}
		});

		// Check if any variant of each color has stock
		colorMap.forEach((color, colorCode) => {
			const hasStock = variants.value.some(
				(variant: ProductVariant) => variant.colorCode === colorCode && variant.stockQuantity > 0,
			);
			color.hasStock = hasStock;
		});

		return Array.from(colorMap.values());
	});

	const getAvailableSizes = computed(() => {
		if (!variants.value.length) return [];

		// Get all unique sizes from variants, regardless of stock
		const sizeMap = new Map();
		variants.value.forEach((variant: ProductVariant) => {
			if (!sizeMap.has(variant.size)) {
				sizeMap.set(variant.size, {
					size: variant.size,
					hasStock: false, // Will be updated below
				});
			}
		});

		// Check if any variant of each size has stock
		sizeMap.forEach((sizeInfo, size) => {
			const hasStock = variants.value.some(
				(variant: ProductVariant) => variant.size === size && variant.stockQuantity > 0,
			);
			sizeInfo.hasStock = hasStock;
		});

		return Array.from(sizeMap.values()).sort((a, b) => a.size.localeCompare(b.size));
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

	// Check if color has any stock
	const isColorAvailable = (colorName: string) => {
		return variants.value.some(
			(variant: ProductVariant) => variant.color === colorName && variant.stockQuantity > 0,
		);
	};

	// Check if size has any stock
	const isSizeAvailable = (size: string) => {
		return variants.value.some(
			(variant: ProductVariant) => variant.size === size && variant.stockQuantity > 0,
		);
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
		...query,

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
		isColorAvailable,
		isSizeAvailable,
		getAverageRating,
		getReviewCount,
	};
}
