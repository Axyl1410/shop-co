<template>
	<div :key="componentKey" class="min-h-screen bg-white">
		<!-- Main Content -->
		<main class="max-w-frame mx-auto px-4 xl:px-0">
			<hr class="mb-5 h-[1px] border-t-black/10 sm:mb-6" />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/shop#men-clothes">Products</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{{ product?.name || 'Loading...' }}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<section class="mb-11">
				<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
					<!-- Product Image Gallery -->
					<Motion
						v-if="product && !isLoading"
						:initial="{ opacity: 0, x: -50 }"
						:animate="{ opacity: 1, x: 0 }"
						:transition="{ duration: 0.6, delay: 0.2 }"
						class="space-y-4"
					>
						<!-- Main Image with Navigation -->
						<div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
							<!-- Main Image -->
							<img
								:src="
									getImageSrc(
										product.images && product.images.length > 0
											? product.images[selectedImageIndex]
											: product.mainImage,
									)
								"
								:alt="product.name"
								class="h-full w-full object-cover transition-all duration-300 hover:scale-105"
								@error="handleImageError"
							/>

							<!-- Navigation Arrows -->
							<div
								v-if="product.images && product.images.length > 1"
								class="absolute inset-0 flex items-center justify-between p-4"
							>
								<button
									@click="previousImage"
									class="rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white"
									:class="{ 'cursor-not-allowed opacity-50': selectedImageIndex === 0 }"
									:disabled="selectedImageIndex === 0"
								>
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</button>
								<button
									@click="nextImage"
									class="rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white"
									:class="{
										'cursor-not-allowed opacity-50':
											selectedImageIndex === (product.images?.length || 1) - 1,
									}"
									:disabled="selectedImageIndex === (product.images?.length || 1) - 1"
								>
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							</div>

							<!-- Image Counter -->
							<div
								v-if="product.images && product.images.length > 1"
								class="absolute top-4 right-4 rounded bg-black/60 px-2 py-1 text-sm text-white"
							>
								{{ selectedImageIndex + 1 }} / {{ product.images.length }}
							</div>

							<!-- Zoom Button -->
							<button
								@click="openLightbox"
								class="absolute right-4 bottom-4 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
									/>
								</svg>
							</button>
						</div>

						<!-- Thumbnails Gallery -->
						<div
							v-if="product.images && product.images.length > 1"
							class="flex space-x-2 overflow-x-auto pb-2"
						>
							<div
								v-for="(image, index) in product.images"
								:key="index"
								class="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:border-gray-400"
								:class="{
									'border-black': selectedImageIndex === index,
									'border-gray-300': selectedImageIndex !== index,
								}"
								@click="selectedImageIndex = index"
							>
								<img
									:src="getImageSrc(image)"
									:alt="`${product.name} - Image ${index + 1}`"
									class="h-full w-full object-cover"
								/>
							</div>
						</div>
					</Motion>
					<!-- Product Info -->
					<Motion
						v-if="product && !isLoading"
						:initial="{ opacity: 0, x: 50 }"
						:animate="{ opacity: 1, x: 0 }"
						:transition="{ duration: 0.6, delay: 0.4 }"
						class="space-y-6"
					>
						<Motion
							:initial="{ opacity: 0, y: 20 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.5, delay: 0.5 }"
						>
							<div class="mb-3 md:mb-3.5">
								<h1 class="text-2xl font-bold uppercase md:text-[40px] md:leading-[40px]">
									{{ product.name }}
								</h1>
								<div class="flex flex-wrap gap-2 mt-2">
									<span v-if="product.isNew" class="bg-green-100 text-green-600 px-2 py-1 text-xs font-medium rounded">
										NEW
									</span>
									<span v-if="product.isFeatured" class="bg-blue-100 text-blue-600 px-2 py-1 text-xs font-medium rounded">
										FEATURED
									</span>
								</div>
							</div>
						</Motion>
						<Motion
							:initial="{ opacity: 0, y: 20 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.5, delay: 0.6 }"
						>
							<div class="mb-3 flex items-center sm:mb-3.5">
								<StarRating :initialValue="getAverageRating" />
								<span class="ml-[11px] pb-0.5 text-xs text-black sm:ml-[13px] sm:pb-0 sm:text-sm">
									{{ getAverageRating.toFixed(1) }}<span class="text-black/60">/5</span>
									<span class="ml-2 text-black/60">({{ getReviewCount }} reviews)</span>
								</span>
							</div>
						</Motion>
						
						<!-- Product Meta Info -->
						<Motion
							:initial="{ opacity: 0, y: 20 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.5, delay: 0.65 }"
						>
							<div class="mb-4 space-y-2 text-sm text-gray-600">
								<div v-if="product.brand" class="flex items-center">
									<span class="font-medium mr-2">Brand:</span>
									<span>{{ product.brand }}</span>
								</div>
								<div v-if="product.sku" class="flex items-center">
									<span class="font-medium mr-2">SKU:</span>
									<span>{{ product.sku }}</span>
								</div>
								<div v-if="product.viewCount" class="flex items-center">
									<span class="font-medium mr-2">Views:</span>
									<span>{{ product.viewCount }}</span>
								</div>
							</div>
						</Motion>
						<Motion
							:initial="{ opacity: 0, y: 20 }"
							:animate="{ opacity: 1, y: 0 }"
							:transition="{ duration: 0.5, delay: 0.7 }"
						>
							<div class="mb-5 flex items-center space-x-2.5 sm:space-x-3">
								<span class="text-2xl font-bold text-black sm:text-[32px]"
									>${{ getVariantByColorAndSize(selectedColor, selectedSize)?.salePrice || product.originalPrice }}</span
								>
								<span v-if="product.originalPrice !== getVariantByColorAndSize(selectedColor, selectedSize)?.salePrice" 
									class="text-lg text-gray-500 line-through">
									${{ product.originalPrice }}
								</span>
								<span v-if="product.discountPercentage > 0" 
									class="bg-red-100 text-red-600 px-2 py-1 text-sm font-medium rounded">
									-{{ product.discountPercentage }}%
								</span>
							</div>
						</Motion>
						<!-- Product Description -->
						<div class="mb-6 space-y-4">
							<p class="text-sm text-black/60 sm:text-base">
								{{ product.description || "No description." }}
							</p>
							
							<!-- Product Tags -->
							<div v-if="product.tags && product.tags.length > 0" class="flex flex-wrap gap-2">
								<span class="text-sm font-medium text-gray-700">Tags:</span>
								<span
									v-for="tag in product.tags"
									:key="tag"
									class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
								>
									{{ tag }}
								</span>
							</div>
						</div>

						<!-- Color Selection -->
						<div class="space-y-3">
							<h3 class="text-sm font-semibold text-black">Select Colors</h3>
							<div v-if="getAvailableColors.length > 0" class="flex space-x-3">
								<button
									v-for="color in getAvailableColors"
									:key="color.code"
									class="h-8 w-8 rounded-full border-2 border-gray-300 transition-all hover:border-black"
									:class="{ 'border-black': selectedColor === color.name }"
									:style="{ backgroundColor: color.code }"
									@click="selectedColor = color.name"
								>
									<svg
										v-if="selectedColor === color.name"
										class="h-4 w-4 text-white mix-blend-difference"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</div>
							<div v-else class="text-sm text-gray-500">
								No colors available (Debug: {{ getAvailableColors.length }} colors found)
							</div>
						</div>

						<!-- Size Selection -->
						<div class="space-y-3">
							<h3 class="text-sm font-semibold text-black">Choose Size</h3>
							<div v-if="getAvailableSizes.length > 0" class="flex flex-wrap gap-2">
								<button
									v-for="size in getAvailableSizes"
									:key="size"
									class="border border-gray-300 px-4 py-2 text-sm font-medium transition-all hover:border-black"
									:class="{ 
										'border-black bg-black text-white': selectedSize === size,
										'opacity-50 cursor-not-allowed': !isVariantAvailable(selectedColor, size)
									}"
									:disabled="!isVariantAvailable(selectedColor, size)"
									@click="selectedSize = size"
								>
									{{ size }}
									<span v-if="!isVariantAvailable(selectedColor, size)" class="text-xs">(Out of stock)</span>
								</button>
							</div>
							<div v-else class="text-sm text-gray-500">
								No sizes available (Debug: {{ getAvailableSizes.length }} sizes found)
							</div>
						</div>

						<!-- Stock Information -->
						<div v-if="getStockQuantity(selectedColor, selectedSize) > 0" class="text-sm text-green-600">
							In Stock: {{ getStockQuantity(selectedColor, selectedSize) }} available
						</div>
						<div v-else class="text-sm text-red-600">
							Out of Stock
						</div>

						<!-- Quantity Selector -->
						<div class="flex items-center space-x-4">
							<div class="flex items-center rounded border border-gray-300">
								<button
									class="px-3 py-2 text-gray-600 hover:text-black"
									:disabled="quantity <= 1"
									@click="quantity > 1 && quantity--"
								>
									-
								</button>
								<span class="px-4 py-2 text-sm font-medium">{{ quantity }}</span>
								<button 
									class="px-3 py-2 text-gray-600 hover:text-black" 
									:disabled="quantity >= getStockQuantity(selectedColor, selectedSize)"
									@click="quantity < getStockQuantity(selectedColor, selectedSize) && quantity++"
								>
									+
								</button>
							</div>
							<button
								class="flex-1 bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
								:disabled="!isVariantAvailable(selectedColor, selectedSize)"
								@click="addToCart"
							>
								{{ isVariantAvailable(selectedColor, selectedSize) ? 'Add to Cart' : 'Out of Stock' }}
							</button>
						</div>
					</Motion>
				</div>
				
				<!-- Loading State -->
				<div v-if="isLoading" class="flex items-center justify-center py-20">
					<div class="text-center">
						<div class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto"></div>
						<p class="text-gray-500">Loading product...</p>
					</div>
				</div>
				
				<!-- Error State -->
				<div v-if="!isLoading && !product" class="flex items-center justify-center py-20">
					<div class="text-center">
						<p class="text-gray-500 mb-4">Product not found</p>
						<button 
							@click="$router.push('/shop')" 
							class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
						>
							Back to Shop
						</button>
					</div>
				</div>
			</section>

			<!-- Product Tabs -->
			<Motion
				v-if="product && !isLoading"
				:initial="{ opacity: 0, y: 30 }"
				:animate="{ opacity: 1, y: 0 }"
				:transition="{ duration: 0.6, delay: 0.6 }"
			>
				<section class="mb-11">
					<div class="border-b border-gray-200">
						<div class="flex space-x-8">
							<button
								v-for="tab in ['Product Details', 'Rating & Reviews', 'FAQs']"
								:key="tab"
								class="border-b-2 py-4 text-sm font-medium transition-colors"
								:class="{
									'border-black text-black': activeTab === tab,
									'border-transparent text-gray-500 hover:text-black': activeTab !== tab,
								}"
								@click="activeTab = tab"
							>
								{{ tab }}
							</button>
						</div>
					</div>

					<!-- Tab Content -->
					<div class="mt-8">
						<div v-if="activeTab === 'Product Details'" class="space-y-6">
							<h3 class="text-lg font-semibold text-black">Product specifications</h3>
							<div class="space-y-3">
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Brand</span>
									<span class="text-sm font-medium">{{ product.brand || 'N/A' }}</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">SKU</span>
									<span class="text-sm font-medium">{{ product.sku || 'N/A' }}</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Category</span>
									<span class="text-sm font-medium">{{ category?.name || 'N/A' }}</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Weight</span>
									<span class="text-sm font-medium">{{ product.weight ? `${product.weight}kg` : 'N/A' }}</span>
								</div>
								<div v-if="product.dimensions" class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Dimensions</span>
									<span class="text-sm font-medium">
										{{ product.dimensions.length }}cm × {{ product.dimensions.width }}cm × {{ product.dimensions.height }}cm
									</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Material composition</span>
									<span class="text-sm font-medium">100% Cotton</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Care instructions</span>
									<span class="text-sm font-medium">Machine wash cold</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Fit</span>
									<span class="text-sm font-medium">Regular fit</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Created</span>
									<span class="text-sm font-medium">{{ formatDate(product.createdAt) }}</span>
								</div>
								<div class="flex justify-between border-b border-gray-100 py-2">
									<span class="text-sm text-gray-600">Last Updated</span>
									<span class="text-sm font-medium">{{ formatDate(product.updatedAt) }}</span>
								</div>
							</div>
						</div>

						<div v-else-if="activeTab === 'Rating & Reviews'" class="space-y-6">
							<!-- Review Summary -->
							<div class="flex items-center space-x-4">
								<div class="text-center">
									<div class="text-3xl font-bold text-black">{{ getAverageRating.toFixed(1) }}</div>
									<div class="flex justify-center mt-1">
										<StarRating :initialValue="getAverageRating" />
									</div>
									<div class="text-sm text-gray-600 mt-1">{{ getReviewCount }} reviews</div>
								</div>
								<div class="flex-1">
									<div class="text-sm text-gray-600">Based on {{ getReviewCount }} customer reviews</div>
								</div>
							</div>

							<!-- Reviews List -->
							<div v-if="reviews.length > 0" class="space-y-4">
								<div
									v-for="review in reviews"
									:key="review.id"
									class="border border-gray-200 rounded-lg p-4"
								>
									<div class="flex items-start justify-between mb-2">
										<div class="flex items-center space-x-2">
											<StarRating :initialValue="review.rating" />
											<span class="text-sm font-medium">{{ review.title }}</span>
										</div>
										<div class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</div>
									</div>
									<p class="text-sm text-gray-700 mb-2">{{ review.content }}</p>
									<div class="flex items-center justify-between text-xs text-gray-500">
										<span v-if="review.isVerified" class="flex items-center">
											<svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
											</svg>
											Verified Purchase
										</span>
										<span>{{ review.isHelpful }} people found this helpful</span>
									</div>
								</div>
							</div>
							<div v-else class="py-8 text-center">
								<p class="text-gray-500">No reviews yet. Be the first to review this product!</p>
							</div>
						</div>

						<div v-else-if="activeTab === 'FAQs'" class="space-y-6">
							<h3 class="text-lg font-semibold text-black">Frequently Asked Questions</h3>
							<div class="space-y-4">
								<div class="border border-gray-200 rounded-lg p-4">
									<h4 class="font-medium text-black mb-2">What is the return policy?</h4>
									<p class="text-sm text-gray-600">We offer a 30-day return policy for all unused items in their original packaging. Return shipping is free for orders over $50.</p>
								</div>
								<div class="border border-gray-200 rounded-lg p-4">
									<h4 class="font-medium text-black mb-2">How long does shipping take?</h4>
									<p class="text-sm text-gray-600">Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee.</p>
								</div>
								<div class="border border-gray-200 rounded-lg p-4">
									<h4 class="font-medium text-black mb-2">Do you offer international shipping?</h4>
									<p class="text-sm text-gray-600">Yes, we ship to most countries worldwide. Shipping times and costs vary by location.</p>
								</div>
								<div class="border border-gray-200 rounded-lg p-4">
									<h4 class="font-medium text-black mb-2">How do I care for this product?</h4>
									<p class="text-sm text-gray-600">Machine wash cold, tumble dry low. Do not bleach. Iron on low heat if needed.</p>
								</div>
								<div class="border border-gray-200 rounded-lg p-4">
									<h4 class="font-medium text-black mb-2">What if the item doesn't fit?</h4>
									<p class="text-sm text-gray-600">We offer free exchanges for different sizes. Please contact our customer service team for assistance.</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</Motion>

			<ProductListSec
				v-if="product && !isLoading"
				:title="`You might also like`"
				:data="relatedProducts"
				:isLoading="isLoading"
			/>
		</main>

		<!-- Lightbox Modal -->
		<Motion
			v-if="isLightboxOpen && product && !isLoading"
			:initial="{ opacity: 0 }"
			:animate="{ opacity: 1 }"
			:exit="{ opacity: 0 }"
			:transition="{ duration: 0.3 }"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
			@click="closeLightbox"
		>
			<div class="relative max-h-full max-w-4xl p-4" @click.stop>
				<!-- Close Button -->
				<button
					@click="closeLightbox"
					class="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<!-- Lightbox Image -->
				<div class="relative">
					<img
						:src="
							getImageSrc(
								product.images && product.images.length > 0
									? product.images[selectedImageIndex]
									: product.mainImage,
							)
						"
						:alt="product.name"
						class="max-h-[80vh] max-w-full object-contain"
					/>

					<!-- Lightbox Navigation -->
					<div
						v-if="product.images && product.images.length > 1"
						class="absolute inset-0 flex items-center justify-between p-4"
					>
						<button
							@click="previousImage"
							class="rounded-full bg-white/20 p-3 text-white transition-all hover:bg-white/30"
							:class="{ 'cursor-not-allowed opacity-50': selectedImageIndex === 0 }"
							:disabled="selectedImageIndex === 0"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							@click="nextImage"
							class="rounded-full bg-white/20 p-3 text-white transition-all hover:bg-white/30"
							:class="{
								'cursor-not-allowed opacity-50':
									selectedImageIndex === (product.images?.length || 1) - 1,
							}"
							:disabled="selectedImageIndex === (product.images?.length || 1) - 1"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>

					<!-- Lightbox Counter -->
					<div
						v-if="product.images && product.images.length > 1"
						class="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded bg-black/60 px-4 py-2 text-lg text-white"
					>
						{{ selectedImageIndex + 1 }} / {{ product.images.length }}
					</div>
				</div>
			</div>
		</Motion>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { Motion } from "motion-v";
import { toast } from "vue-sonner";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import StarRating from "@/components/ui/Rating.vue";
import { useProductDetail } from "@/hook/use-product-detail";
import { useCartStore } from "@/stores/use-cart-store";
import { formatDate } from "@/lib/utils";
import type { CartType } from "@/types/cart";

// Import images for mapping
import pic1 from "@/assets/images/pic1.png";
import pic2 from "@/assets/images/pic2.png";
import pic3 from "@/assets/images/pic3.png";
import pic4 from "@/assets/images/pic4.png";
import pic5 from "@/assets/images/pic5.png";
import pic6 from "@/assets/images/pic6.png";
import pic7 from "@/assets/images/pic7.png";
import pic8 from "@/assets/images/pic8.png";
import pic9 from "@/assets/images/pic9.png";
import pic10 from "@/assets/images/pic10.png";
import pic11 from "@/assets/images/pic11.png";
import pic12 from "@/assets/images/pic12.png";
import pic13 from "@/assets/images/pic13.png";
import pic14 from "@/assets/images/pic14.png";
import pic15 from "@/assets/images/pic15.png";
import ProductListSec from "@/components/section/home/product-list-sec.vue";

const route = useRoute();
const productId = computed(() => route.params.id as string);

//  lấy thông tin chi tiết sản phẩm
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

// dat gia tri mac dinh cho color va size
watch(product, (newProduct) => {
	console.log("Product changed:", newProduct);
	if (newProduct && getAvailableColors.value.length > 0) {
		console.log("Available colors:", getAvailableColors.value);
		selectedColor.value = getAvailableColors.value[0].name;
	}
	if (newProduct && getAvailableSizes.value.length > 0) {
		console.log("Available sizes:", getAvailableSizes.value);
		selectedSize.value = getAvailableSizes.value[0];
	}
}, { immediate: true });

// check xem co variant nao khong
watch(product, (newProduct) => {
	console.log("Product changed:", newProduct);
	console.log("Available colors:", getAvailableColors.value);
	console.log("Available sizes:", getAvailableSizes.value);
}, { immediate: true });

// Watch for route changes to reset states when navigating to different products
watch(
	() => route.params.id,
	() => {
		// Reset states when navigating to a different product
		selectedColor.value = "";
		selectedSize.value = "";
		quantity.value = 1;
		activeTab.value = "Product Details";
		selectedImageIndex.value = 0;
		isLightboxOpen.value = false;
		// Scroll to top when navigating to different product
		window.scrollTo({ top: 0, behavior: "smooth" });
	},
	{ immediate: true }
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
		
		// Add product to cart with selected variant
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
		
		// Show success message
		toast.success(`Added ${quantity.value} ${product.value.name} to cart`);
		
		console.log("Added to cart:", {
			product: product.value.name,
			color: selectedColor.value,
			size: selectedSize.value,
			quantity: quantity.value,
			variant: selectedVariant,
		});
	}
};

// Handle image loading errors
const handleImageError = (event: Event) => {
	const img = event.target as HTMLImageElement;
	img.src = pic1; // Fallback to first image
};

// Gallery navigation functions
const previousImage = () => {
	if (product.value?.images && selectedImageIndex.value > 0) {
		selectedImageIndex.value--;
	}
};

const nextImage = () => {
	if (product.value?.images && selectedImageIndex.value < product.value.images.length - 1) {
		selectedImageIndex.value++;
	}
};

// Lightbox functions
const openLightbox = () => {
	isLightboxOpen.value = true;
};

const closeLightbox = () => {
	isLightboxOpen.value = false;
};

// Keyboard navigation for lightbox
const handleKeydown = (event: KeyboardEvent) => {
	if (!isLightboxOpen.value) return;
	switch (event.key) {
		case "Escape":
			closeLightbox();
			break;
		case "ArrowLeft":
			previousImage();
			break;
		case "ArrowRight":
			nextImage();
			break;
	}
};

// Add keyboard event listener
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
