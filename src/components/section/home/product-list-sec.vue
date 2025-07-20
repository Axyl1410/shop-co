<script setup lang="ts">
import ProductCard from "@/components/section/home/product-card.vue";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { Product } from "@/types";
import { Motion } from "motion-v";

interface Props {
	title: string;
	data: Product[];
	viewAllLink?: string;
}

defineProps<Props>();
</script>

<template>
	<section class="container mx-auto text-center">
		<Motion
			:initial="{ y: '100px', opacity: 0 }"
			:while-in-view="{ y: '0', opacity: 1 }"
			:in-view-options="{ once: true }"
			:transition="{ duration: 0.6 }"
			class="font-integralCF mb-8 text-[32px] capitalize md:mb-14 md:text-5xl"
		>
			{{ title }}
		</Motion>

		<Motion
			:initial="{ y: '100px', opacity: 0 }"
			:while-in-view="{ y: '0', opacity: 1 }"
			:in-view-options="{ once: true }"
			:transition="{ delay: 0.6, duration: 0.6 }"
		>
			<Carousel :opts="{ align: 'start' }" class="mb-6 w-full md:mb-9">
				<CarouselContent class="mx-4 space-x-4 sm:space-x-5 xl:mx-0">
					<CarouselItem
						v-for="product in data"
						:key="product.id"
						class="w-full max-w-[198px] pl-0 sm:max-w-[295px]"
					>
						<ProductCard :data="product" />
					</CarouselItem>
				</CarouselContent>
			</Carousel>

			<div v-if="viewAllLink" class="w-full px-4 text-center sm:px-0">
				<router-link
					:to="viewAllLink"
					class="inline-block w-full rounded-full border border-black/10 px-[54px] py-4 text-sm font-medium text-black transition-all hover:bg-black hover:text-white sm:w-[218px] sm:text-base"
				>
					View All
				</router-link>
			</div>
		</Motion>
	</section>
</template>
