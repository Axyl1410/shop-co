<script setup lang="ts">
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
import ProductCardSkeleton from "@/components/skeleton/product-card-skeleton.vue";
import Rating from "@/components/ui/Rating.vue";
import { calculatePrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
	data?: Product;
	isLoading?: boolean;
}

defineProps<Props>();

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

const getImageSrc = (imagePath: string) => {
	return imageMap[imagePath] || imagePath;
};
</script>

<template>
	<template v-if="isLoading">
		<ProductCardSkeleton />
	</template>
	<template v-else-if="data">
		<router-link :to="`/shop/product/${data.id}`" class="flex aspect-auto flex-col items-start">
			<div
				class="mb-2.5 aspect-square w-full overflow-hidden rounded-[13px] bg-[#F0EEED] lg:max-w-[295px] lg:rounded-[20px] xl:mb-4"
			>
				<img
					:src="getImageSrc(data.mainImage)"
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
					<span class="text-xl font-bold text-black xl:text-2xl"> ${{ data.salePrice }} </span>
				</template>
			</div>
		</router-link>
	</template>
</template>
