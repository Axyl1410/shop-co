<script setup lang="ts">
import CheckmarkCircle from "@/assets/icons/CheckmarkCircle.vue";
import EllipsisHorizontal from "@/assets/icons/EllipsisHorizontal.vue";
import Rating from "@/components/ui/Rating.vue";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { Review } from "@/types";

interface Props {
	isAction?: boolean;
	isDate?: boolean;
	data: Review;
	className?: string;
}

withDefaults(defineProps<Props>(), {
	isAction: false,
	isDate: false,
});
</script>

<template>
	<div
		:class="
			cn([
				'relative flex aspect-auto flex-col items-start overflow-hidden rounded-[20px] border border-black/10 bg-white p-6 sm:px-8 sm:py-7',
				className,
			])
		"
	>
		<div class="mb-3 flex w-full items-center justify-between sm:mb-4">
			<Rating
				:initial-value="data.rating"
				:allow-fraction="true"
				svg-class-name="inline-block"
				:size="23"
			/>
			<Button v-if="isAction" variant="ghost" size="icon">
				<EllipsisHorizontal />
			</Button>
		</div>

		<div class="mb-2 flex items-center sm:mb-3">
			<strong class="mr-1 text-black sm:text-xl">{{ data.title }}</strong>
			<CheckmarkCircle />
		</div>

		<p class="text-sm text-black/60 sm:text-base">{{ data.content }}</p>

		<p v-if="isDate" class="mt-4 text-sm font-medium text-black/60 sm:mt-6">
			Posted on {{ formatDate(data.createdAt) }}
		</p>
	</div>
</template>
