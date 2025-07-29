<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { ref } from "vue";
import { RouterLink } from "vue-router";

interface DressStyle {
	title: string;
	slug: string;
}

const dressStylesData: DressStyle[] = [
	{
		title: "Casual",
		slug: "/shop?style=casual",
	},
	{
		title: "Formal",
		slug: "/shop?style=formal",
	},
	{
		title: "Party",
		slug: "/shop?style=party",
	},
	{
		title: "Gym",
		slug: "/shop?style=gym",
	},
];

// Accordion state
const isExpanded = ref(true);

// Toggle accordion
const toggleAccordion = () => {
	isExpanded.value = !isExpanded.value;
};
</script>

<template>
	<div class="border-none">
		<!-- Accordion Trigger -->
		<button
			@click="toggleAccordion"
			class="flex w-full items-center justify-between p-0 py-0.5 text-xl font-bold text-black hover:no-underline"
		>
			<span>Dress Style</span>
			<svg
				class="h-4 w-4 transition-transform"
				:class="{ 'rotate-180': isExpanded }"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Accordion Content -->
		<div v-show="isExpanded" class="pt-4 pb-0">
			<div class="flex flex-col space-y-0.5 text-black/60">
				<RouterLink
					v-for="(dStyle, idx) in dressStylesData"
					:key="idx"
					:to="dStyle.slug"
					class="flex items-center justify-between py-2 transition-colors hover:text-black/80"
				>
					<span>{{ dStyle.title }}</span>
					<ChevronRight class="h-4 w-4" />
				</RouterLink>
			</div>
		</div>
	</div>
</template>
