<template>
	<div :key="componentKey" class="min-h-screen bg-white">
		<!-- Main Content -->
		<main class="container mx-auto px-4 xl:px-0">
			<hr class="mb-5 h-[1px] border-t-black/10 sm:mb-6" />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/product">Products</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{{ product?.name || "Loading..." }}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<section class="mt-8 mb-11">
				<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
					<ProductImageGallery
						:product="product ?? null"
						:is-loading="isLoading"
						:selected-image-index="selectedImageIndex"
						:is-lightbox-open="isLightboxOpen"
						:get-image-src="getImageSrc"
						@update:selected-image-index="selectedImageIndex = $event"
						@update:is-lightbox-open="isLightboxOpen = $event"
					/>
					<ProductInfo
						:product="product ?? null"
						:is-loading="isLoading"
						:get-available-colors="getAvailableColors"
						:get-available-sizes="getAvailableSizes"
						:get-variant-by-color-and-size="getVariantByColorAndSize"
						:get-stock-quantity="getStockQuantity"
						:is-variant-available="isVariantAvailable"
						:get-average-rating="getAverageRating"
						:get-review-count="getReviewCount"
						:selected-color="selectedColor"
						:selected-size="selectedSize"
						:quantity="quantity"
						@update:selected-color="selectedColor = $event"
						@update:selected-size="selectedSize = $event"
						@update:quantity="quantity = $event"
						@add-to-cart="addToCart"
					/>
				</div>

				<!-- Loading State -->
				<div v-if="isLoading" class="flex items-center justify-center py-20">
					<div class="text-center">
						<div
							class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"
						></div>
						<p class="text-gray-500">Loading product...</p>
					</div>
				</div>

				<!-- Error State -->
				<div v-if="!isLoading && !product" class="flex items-center justify-center py-20">
					<div class="text-center">
						<p class="mb-4 text-gray-500">Product not found</p>
						<button
							@click="$router.push('/shop')"
							class="rounded bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
						>
							Back to Shop
						</button>
					</div>
				</div>
			</section>

			<ProductTabs
				v-if="product && !isLoading"
				:product="product"
				:category="category ?? null"
				:reviews="reviews"
				:get-average-rating="getAverageRating"
				:get-review-count="getReviewCount"
				:active-tab="activeTab"
				:is-loading="isLoading"
				@update:active-tab="activeTab = $event"
			/>

			<ProductListSec
				v-if="product && !isLoading"
				:title="`You might also like`"
				:data="relatedProducts"
				:is-loading="isLoading"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import ProductImageGallery from "@/components/section/product/ProductImageGallery.vue";
import ProductInfo from "@/components/section/product/ProductInfor.vue";
import ProductTabs from "@/components/section/product/ProductTab.vue";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import ProductListSec from "@/components/section/home/product-list-sec.vue";
import { useProductDetail } from "@/hook/use-product-detail";
import { useCartStore } from "@/stores/use-cart-store";
import type { CartType } from "@/types/cart";

// Import images for mapping
import pic1 from "@/assets/images/pic1.png";
import pic10 from "@/assets/images/pic10.png";
import pic11 from "@/assets/images/pic11.png";
import pic12 from "@/assets/images/pic12.png";
import pic13 from "@/assets/images/pic13.png";
import pic14 from "@/assets/images/pic14.png";
import pic15 from "@/assets/images/pic15.png";
import pic2 from "@/assets/images/pic2.png";
import pic3 from "@/assets/images/pic3.png";
import pic4 from "@/assets/images/pic4.png";
import pic5 from "@/assets/images/pic5.png";
import pic6 from "@/assets/images/pic6.png";
import pic7 from "@/assets/images/pic7.png";
import pic8 from "@/assets/images/pic8.png";
import pic9 from "@/assets/images/pic9.png";

const route = useRoute();
const productId = computed(() => route.params.id as string);

// Fetch product details
const {
	product,
	isLoading,
	relatedProducts,
	category,
	reviews,
	getAvailableColors,
	getAvailableSizes,
	getVariantByColorAndSize,
	getStockQuantity,
	isVariantAvailable,
	getAverageRating,
	getReviewCount,
} = useProductDetail(productId.value);

// Cart store
const cartStore = useCartStore();

// Image mapping function
const imageMap: Record<string, string> = {
	"/images/pic1.png": pic1,
	"/images/pic2.png": pic2,
	"/images/pic3.png": pic3,
	"/images/pic4.png": pic4,
	"/images/pic5.png": pic5,
	"/images/pic6.png": pic6,
	"/images/pic7.png": pic7,
	"/images/pic8.png": pic8,
	"/images/pic9.png": pic9,
	"/images/pic10.png": pic10,
	"/images/pic11.png": pic11,
	"/images/pic12.png": pic12,
	"/images/pic13.png": pic13,
	"/images/pic14.png": pic14,
	"/images/pic15.png": pic15,
};

// Function to get image from mapping
const getImageSrc = (imagePath: string) => {
	if (!imagePath) {
		return pic1; // Fallback to first image
	}
	return imageMap[imagePath] || pic1; // Return mapped image or fallback
};

// Product selection state
const selectedColor = ref("");
const selectedSize = ref("");
const quantity = ref(1);
const activeTab = ref("Product Details");
const selectedImageIndex = ref(0);
const isLightboxOpen = ref(false);

// Set default color and size
watch(
	product,
	(newProduct) => {
		if (newProduct && getAvailableColors.value.length > 0) {
			const availableColor = getAvailableColors.value.find((color) => color.hasStock);
			selectedColor.value = availableColor ? availableColor.name : getAvailableColors.value[0].name;
		}
		if (newProduct && getAvailableSizes.value.length > 0) {
			const availableSize = getAvailableSizes.value.find((size) => size.hasStock);
			selectedSize.value = availableSize ? availableSize.size : getAvailableSizes.value[0].size;
		}
	},
	{ immediate: true },
);

// Watch for route changes to reset states
watch(
	() => route.params.id,
	() => {
		selectedColor.value = "";
		selectedSize.value = "";
		quantity.value = 1;
		activeTab.value = "Product Details";
		selectedImageIndex.value = 0;
		isLightboxOpen.value = false;
		window.scrollTo({ top: 0, behavior: "smooth" });
	},
	{ immediate: true },
);

// Force component re-render when product changes
const componentKey = computed(() => `product-${productId.value}`);

// Add to cart function
const addToCart = () => {
	if (product.value) {
		const selectedVariant = getVariantByColorAndSize(selectedColor.value, selectedSize.value);

		if (!selectedVariant) {
			toast.error("Please select a valid color and size");
			return;
		}

		if (!isVariantAvailable(selectedColor.value, selectedSize.value)) {
			toast.error("This variant is out of stock");
			return;
		}

		const availableStock = getStockQuantity(selectedColor.value, selectedSize.value);
		if (quantity.value > availableStock) {
			toast.error(`Only ${availableStock} items available in stock`);
			return;
		}

		const productWithVariant: CartType = {
			...product.value,
			selectedColor: selectedColor.value,
			selectedSize: selectedSize.value,
			selectedColorCode: selectedVariant.colorCode,
			variantId: selectedVariant.id,
			variantSku: selectedVariant.sku,
			price: selectedVariant.salePrice,
			quantity: quantity.value,
		};

		cartStore.addToCart(productWithVariant, quantity.value);
		toast.success(`Added ${quantity.value} ${product.value.name} to cart`);
	}
};

// Keyboard navigation for lightbox
const handleKeydown = (event: KeyboardEvent) => {
	if (!isLightboxOpen.value) return;
	switch (event.key) {
		case "Escape":
			isLightboxOpen.value = false;
			break;
		case "ArrowLeft":
			if (product.value?.images && selectedImageIndex.value > 0) {
				selectedImageIndex.value--;
			}
			break;
		case "ArrowRight":
			if (product.value?.images && selectedImageIndex.value < product.value.images.length - 1) {
				selectedImageIndex.value++;
			}
			break;
	}
};

onMounted(() => {
	document.addEventListener("keydown", handleKeydown);
	window.scrollTo({ top: 0, behavior: "smooth" });
});

onUnmounted(() => {
	document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.max-w-frame {
	max-width: 1280px;
}
</style>
