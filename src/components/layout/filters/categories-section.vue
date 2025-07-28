<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";

interface Category {
	title: string;
	slug: string;
}

const categoriesData: Category[] = [
	{
		title: "T-shirts",
		slug: "/shop?category=t-shirts",
	},
	{
		title: "Shorts",
		slug: "/shop?category=shorts",
	},
	{
		title: "Shirts",
		slug: "/shop?category=shirts",
	},
	{
		title: "Hoodie",
		slug: "/shop?category=hoodie",
	},
	{
		title: "Jeans",
		slug: "/shop?category=jeans",
	},
];
</script>

<template>
	<div class="flex flex-col space-y-0.5 text-black/60">
		<RouterLink
			v-for="(category, idx) in categoriesData"
			:key="idx"
			:to="category.slug"
			class="flex items-center justify-between py-2 transition-colors hover:text-black/80"
		>
			<span>{{ category.title }}</span>
			<ChevronRight class="h-4 w-4" />
		</RouterLink>
	</div>
</template>
