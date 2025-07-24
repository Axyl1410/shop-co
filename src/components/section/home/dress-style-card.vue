<script setup lang="ts">
import { cn } from "@/lib/utils";

interface Props {
	title: string;
	url: string;
	className?: string;
}

defineProps<Props>();
</script>

<template>
	<router-link
		:to="url"
		:class="
			cn([
				'w-full rounded-[20px] bg-white bg-cover bg-top bg-no-repeat px-6 py-4 text-left text-2xl font-bold md:h-full md:px-9 md:py-[25px] md:text-4xl',
				className,
			])
		"
	>
		{{ title }}
	</router-link>
</template>
