<template>
	<Motion
		v-if="product && !isLoading"
		:initial="{ opacity: 0, x: -50 }"
		:animate="{ opacity: 1, x: 0 }"
		:transition="{ duration: 0.6, delay: 0.2 }"
		class="space-y-4"
	>
		<!-- Main Image with Navigation -->
		<div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
				jobbet
			/>
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
				@click="$emit('update:selectedImageIndex', index)"
			>
				<img
					:src="getImageSrc(image)"
					:alt="`${product.name} - Image ${index + 1}`"
					class="h-full w-full object-cover"
				/>
			</div>
		</div>
	</Motion>

	<!-- Lightbox Modal -->
	<Motion
		v-if="isLightboxOpen && product && !isLoading"
		:initial="{ opacity: 0 }"
		:animate="{ opacity: 1 }"
		:exit="{ opacity: 0 }"
		:transition="{ duration: 0.3 }"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
		@click="$emit('update:isLightboxOpen', false)"
	>
		<div class="relative max-h-full max-w-4xl p-4" @click.stop>
			<!-- Close Button -->
			<button
				@click="$emit('update:isLightboxOpen', false)"
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
</template>

<script setup lang="ts">
import type { Product } from "@/types";
import { Motion } from "motion-v";
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
	product: Product | null;
	isLoading: boolean;
	selectedImageIndex: number;
	isLightboxOpen: boolean;
	getImageSrc: (imagePath: string) => string;
}>();

const emit = defineEmits<{
	(event: "update:selectedImageIndex", value: number): void;
	(event: "update:isLightboxOpen", value: boolean): void;
}>();

const handleImageError = (event: Event) => {
	const img = event.target as HTMLImageElement;
	img.src = "/images/pic1.png"; // Fallback image
};

const previousImage = () => {
	if (props.product?.images && props.selectedImageIndex > 0) {
		emit("update:selectedImageIndex", props.selectedImageIndex - 1);
	}
};

const nextImage = () => {
	if (props.product?.images && props.selectedImageIndex < props.product.images.length - 1) {
		emit("update:selectedImageIndex", props.selectedImageIndex + 1);
	}
};

const openLightbox = () => {
	emit("update:isLightboxOpen", true);
};
</script>
