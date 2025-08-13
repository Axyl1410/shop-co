<template>
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
						@click="$emit('update:activeTab', tab)"
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
							<span class="text-sm font-medium">{{ product.brand || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">SKU</span>
							<span class="text-sm font-medium">{{ product.sku || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Category</span>
							<span class="text-sm font-medium">{{ category?.name || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Weight</span>
							<span class="text-sm font-medium">{{
								product.weight ? `${product.weight}kg` : "N/A"
							}}</span>
						</div>
						<div
							v-if="product.dimensions"
							class="flex justify-between border-b border-gray-100 py-2"
						>
							<span class="text-sm text-gray-600">Dimensions</span>
							<span class="text-sm font-medium">
								{{ product.dimensions.length }}cm × {{ product.dimensions.width }}cm ×
								{{ product.dimensions.height }}cm
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
							<div class="mt-1 flex justify-center">
								<StarRating :initialValue="getAverageRating" />
							</div>
							<div class="mt-1 text-sm text-gray-600">{{ getReviewCount }} reviews</div>
						</div>
						<div class="flex-1">
							<div class="text-sm text-gray-600">
								Based on {{ getReviewCount }} customer reviews
							</div>
						</div>
					</div>

					<!-- Reviews List -->
					<div v-if="reviews.length > 0" class="space-y-4">
						<div
							v-for="review in reviews"
							:key="review.id"
							class="rounded-lg border border-gray-200 p-4"
						>
							<div class="mb-2 flex items-start justify-between">
								<div class="flex items-center space-x-2">
									<StarRating :initialValue="review.rating" />
									<span class="text-sm font-medium">{{ review.title }}</span>
								</div>
								<div class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</div>
							</div>
							<p class="mb-2 text-sm text-gray-700">{{ review.content }}</p>
							<div
								v-if="review.reply"
								class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3"
							>
								<div class="mb-1 flex items-center justify-between">
									<div class="flex items-center space-x-2">
										<!-- Icon phản hồi -->
										<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M18 13V6a2 2 0 00-2-2H8L4 6v7a2 2 0 002 2h10a2 2 0 002-2z" />
										</svg><LiaReplySolid />
										<span class="text-sm font-semibold text-green-700">Seller Reply</span>
									</div>
									<span class="text-xs text-gray-500">
										{{ review.replyDate ? new Date(review.replyDate).toLocaleDateString() : "-" }}
									</span>
								</div>
								<p class="text-sm whitespace-pre-line text-gray-800">
									{{ review.reply }}
								</p>
							</div>
							<div class="flex items-center justify-between text-xs text-gray-500">
								<span v-if="review.isVerified" class="flex items-center">
									<svg class="mr-1 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
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
						<div class="rounded-lg border border-gray-200 p-4">
							<h4 class="mb-2 font-medium text-black">What is the return policy?</h4>
							<p class="text-sm text-gray-600">
								We offer a 30-day return policy for all unused items in their original packaging.
								Return shipping is free for orders over $50.
							</p>
						</div>
						<div class="rounded-lg border border-gray-200 p-4">
							<h4 class="mb-2 font-medium text-black">How long does shipping take?</h4>
							<p class="text-sm text-gray-600">
								Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is
								available for an additional fee.
							</p>
						</div>
						<div class="rounded-lg border border-gray-200 p-4">
							<h4 class="mb-2 font-medium text-black">Do you offer international shipping?</h4>
							<p class="text-sm text-gray-600">
								Yes, we ship to most countries worldwide. Shipping times and costs vary by location.
							</p>
						</div>
						<div class="rounded-lg border border-gray-200 p-4">
							<h4 class="mb-2 font-medium text-black">How do I care for this product?</h4>
							<p class="text-sm text-gray-600">
								Machine wash cold, tumble dry low. Do not bleach. Iron on low heat if needed.
							</p>
						</div>
						<div class="rounded-lg border border-gray-200 p-4">
							<h4 class="mb-2 font-medium text-black">What if the item doesn't fit?</h4>
							<p class="text-sm text-gray-600">
								We offer free exchanges for different sizes. Please contact our customer service
								team for assistance.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</Motion>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { defineProps, defineEmits } from "vue";
import StarRating from "@/components/ui/Rating.vue";
import { formatDate } from "@/lib/utils";
import type { Product, Review } from "@/types";
import type { Category } from "@/types/category";

defineProps<{
	product: Product | null;
	category: Category | null;
	reviews: Review[];
	getAverageRating: number;
	getReviewCount: number;
	activeTab: string;
	isLoading: boolean;
}>();

defineEmits<{
	(event: "update:activeTab", value: string): void;
}>();
</script>
