<script setup lang="ts">
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
</script>

<template>
	<div class="flex aspect-auto flex-col items-start">
		<Skeleton
			class="mb-2.5 aspect-square h-[198px] w-full overflow-hidden rounded-[13px] bg-[#F0EEED] sm:h-[295px] lg:max-w-[295px] lg:rounded-[20px] xl:mb-4"
		/>
		<Skeleton class="mb-2 h-6 w-3/4" />
		<div class="mb-1 flex items-end xl:mb-2">
			<Skeleton class="mr-2 h-5 w-16" />
			<Skeleton class="h-4 w-8" />
		</div>
		<div class="flex items-center space-x-[5px] xl:space-x-2.5">
			<Skeleton class="h-7 w-20" />
			<Skeleton class="h-7 w-14" />
			<Skeleton class="h-6 w-10" />
		</div>
	</div>
</template>
