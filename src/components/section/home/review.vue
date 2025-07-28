<script setup lang="ts">
import ReviewCardSkeleton from "@/components/skeleton/review-card-skeleton.vue";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { Review } from "@/types";
import { Motion } from "motion-v";
import ReviewCard from "./review-card.vue";

interface Props {
	data: Review[];
	isLoading: boolean;
}

defineProps<Props>();
</script>

<template>
	<section class="container mx-auto overflow-hidden">
		<Motion
			:initial="{ x: '100px', opacity: 0 }"
			:while-in-view="{ x: '0', opacity: 1 }"
			:in-view-options="{ once: true }"
			:transition="{ duration: 0.6 }"
		>
			<Carousel :opts="{ align: 'center', loop: true }" class="relative mb-6 w-full md:mb-9">
				<div
					class="relative mx-auto mb-6 flex items-center justify-between px-4 sm:items-center md:mb-10 xl:px-0"
				>
					<Motion
						:initial="{ y: '100px', opacity: 0 }"
						:while-in-view="{ y: '0', opacity: 1 }"
						:in-view-options="{ once: true }"
						:transition="{ delay: 0.6, duration: 0.6 }"
						class="font-integralCF mr-auto text-[32px] leading-[36px] capitalize md:text-5xl"
					>
						OUR HAPPY CUSTOMERS
					</Motion>
					<div class="absolute right-20 z-50 hidden text-black sm:block">
						<CarouselPrevious />
						<CarouselNext />
					</div>
				</div>

				<CarouselContent>
					<template v-if="!isLoading && data.length">
						<CarouselItem
							v-for="review in data"
							:key="review.id"
							class="w-full max-w-[358px] pl-5 sm:max-w-[400px]"
						>
							<ReviewCard class="h-full" :data="review" /> </CarouselItem
					></template>
					<template v-else>
						<CarouselItem
							v-for="item in 4"
							:key="item"
							class="w-full max-w-[358px] pl-5 sm:max-w-[400px]"
						>
							<ReviewCardSkeleton />
						</CarouselItem>
					</template>
				</CarouselContent>
			</Carousel>
		</Motion>
	</section>
</template>
