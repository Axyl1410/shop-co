<script setup lang="ts">
import Rating from "@/components/ui/Rating.vue";
import { calculatePrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
	data: Product;
}

defineProps<Props>();
</script>

<template>
	<div>
		<router-link :to="`/product/${data.id}`" class="flex aspect-auto flex-col items-start">
			<div
				class="mb-2.5 aspect-square w-full overflow-hidden rounded-[13px] bg-[#F0EEED] lg:max-w-[295px] lg:rounded-[20px] xl:mb-4"
			>
				<img
					:src="`/src/assets${data.images[0]}`"
					:alt="data.name"
					class="h-full w-full rounded-md object-contain transition-all duration-500 hover:scale-110"
				/>
			</div>

			<strong class="text-black xl:text-xl">{{ data.name }}</strong>

			<div class="mb-1 flex items-end xl:mb-2">
				<Rating
					:initial-value="data.rating"
					:allow-fraction="true"
					svg-class-name="inline-block"
					empty-class-name="fill-gray-50"
					:size="19"
					:readonly="true"
				/>
				<span class="ml-[11px] pb-0.5 text-xs text-black xl:ml-[13px] xl:pb-0 xl:text-sm">
					{{ data.rating.toFixed(1) }}
					<span class="text-black/60">/5</span>
				</span>
			</div>

			<div class="flex items-center space-x-[5px] xl:space-x-2.5">
				<template v-if="calculatePrice(data).hasDiscount">
					<span class="text-xl font-bold text-black xl:text-2xl">
						${{ calculatePrice(data).finalPrice }}
					</span>
					<span class="text-xl font-bold text-black/40 line-through xl:text-2xl">
						${{ calculatePrice(data).originalPrice }}
					</span>
					<span
						class="rounded-full bg-[#FF3333]/10 px-3.5 py-1.5 text-[10px] font-medium text-[#FF3333] xl:text-xs"
					>
						-{{ calculatePrice(data).discountPercentage }}%
					</span>
				</template>
				<template v-else>
					<span class="text-xl font-bold text-black xl:text-2xl">
						${{ calculatePrice(data).finalPrice }}
					</span>
				</template>
			</div>
		</router-link>
	</div>
</template>
