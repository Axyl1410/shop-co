<template>
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
				<div class="mt-2 flex flex-wrap gap-2">
					<span
						v-if="product.isNew"
						class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-600"
					>
						NEW
					</span>
					<span
						v-if="product.isFeatured"
						class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600"
					>
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
					<span class="mr-2 font-medium">Brand:</span>
					<span>{{ product.brand }}</span>
				</div>
				<div v-if="product.sku" class="flex items-center">
					<span class="mr-2 font-medium">SKU:</span>
					<span>{{ product.sku }}</span>
				</div>
				<div v-if="product.viewCount" class="flex items-center">
					<span class="mr-2 font-medium">Views:</span>
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
					>${{
						getVariantByColorAndSize(selectedColor, selectedSize)?.salePrice ||
						product.originalPrice
					}}</span
				>
				<span
					v-if="
						product.originalPrice !==
						getVariantByColorAndSize(selectedColor, selectedSize)?.salePrice
					"
					class="text-lg text-gray-500 line-through"
				>
					${{ product.originalPrice }}
				</span>
				<span
					v-if="product.discountPercentage > 0"
					class="rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-600"
				>
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
				<Button
					v-for="color in getAvailableColors"
					:key="color.code"
					:class="
						cn(
							'!h-8 !w-8 rounded-full border-2 border-gray-300 !p-2 transition-all hover:border-black',
							{
								'border-black': selectedColor === color.name,
								'cursor-not-allowed opacity-50': !color.hasStock,
							},
						)
					"
					:style="{ backgroundColor: color.code }"
					:disabled="!color.hasStock"
					@click="color.hasStock && $emit('update:selectedColor', color.name)"
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
				</Button>
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
					v-for="sizeInfo in getAvailableSizes"
					:key="sizeInfo.size"
					:class="
						cn(
							'border border-gray-300 !px-4 !py-2 text-sm font-medium transition-all hover:border-black',
							{
								'border-black bg-black text-white': selectedSize === sizeInfo.size,
								'cursor-not-allowed opacity-50': !sizeInfo.hasStock,
							},
						)
					"
					variant="outline"
					:disabled="!sizeInfo.hasStock"
					@click="sizeInfo.hasStock && $emit('update:selectedSize', sizeInfo.size)"
				>
					{{ sizeInfo.size }}
					<span v-if="!sizeInfo.hasStock" class="text-xs">(Out of stock)</span>
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
		<div v-else-if="selectedColor && selectedSize" class="text-sm text-red-600">
			Out of Stock for {{ selectedColor }} - {{ selectedSize }}
		</div>
		<div v-else class="text-sm text-gray-500">
			Please select color and size to see stock information
		</div>

		<!-- Quantity Selector -->
		<div class="flex items-center space-x-4">
			<div class="flex items-center rounded border border-gray-300">
				<button
					class="px-3 py-2 text-gray-600 hover:text-black"
					:disabled="quantity <= 1"
					@click="quantity > 1 && $emit('update:quantity', quantity - 1)"
				>
					-
				</button>
				<span class="px-4 py-2 text-sm font-medium">{{ quantity }}</span>
				<button
					class="px-3 py-2 text-gray-600 hover:text-black"
					:disabled="quantity >= getStockQuantity(selectedColor, selectedSize)"
					@click="
						quantity < getStockQuantity(selectedColor, selectedSize) &&
						$emit('update:quantity', quantity + 1)
					"
				>
					+
				</button>
			</div>
			<button
				class="flex-1 bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
				:disabled="!isVariantAvailable(selectedColor, selectedSize)"
				@click="$emit('add-to-cart')"
			>
				{{ isVariantAvailable(selectedColor, selectedSize) ? "Add to Cart" : "Out of Stock" }}
			</button>
		</div>
	</Motion>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { defineProps, defineEmits } from "vue";
import StarRating from "@/components/ui/Rating.vue";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

defineProps<{
	product: Product | null;
	isLoading: boolean;
	getAvailableColors: Array<{
		name: string;
		code: string;
		hasStock: boolean;
	}>;
	getAvailableSizes: Array<{
		size: string;
		hasStock: boolean;
	}>;
	getVariantByColorAndSize: (color: string, size: string) => ProductVariant | undefined;
	getStockQuantity: (color: string, size: string) => number;
	isVariantAvailable: (color: string, size: string) => boolean;
	getAverageRating: number;
	getReviewCount: number;
	selectedColor: string;
	selectedSize: string;
	quantity: number;
}>();

defineEmits<{
	(event: "update:selectedColor", value: string): void;
	(event: "update:selectedSize", value: string): void;
	(event: "update:quantity", value: number): void;
	(event: "add-to-cart"): void;
}>();
</script>
