<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
	className?: string;
}

defineProps<Props>();
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
			<div class="flex gap-1">
				<Skeleton class="h-6 w-6" />
				<Skeleton class="h-6 w-6" />
				<Skeleton class="h-6 w-6" />
				<Skeleton class="h-6 w-6" />
				<Skeleton class="h-6 w-6" />
			</div>
			<Skeleton class="h-8 w-8 rounded-full" />
		</div>

		<div class="mb-2 flex items-center sm:mb-3">
			<Skeleton class="mr-2 h-6 w-32 sm:h-7 sm:w-40" />
			<Skeleton class="h-5 w-5 rounded-full" />
		</div>

		<div class="space-y-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
			<Skeleton class="h-4 w-1/2" />
		</div>

		<Skeleton class="mt-4 h-4 w-32 sm:mt-6" />
	</div>
</template>
