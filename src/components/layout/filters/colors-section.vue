<script setup lang="ts">
import { cn } from "@/lib/utils";
import { Check } from "lucide-vue-next";
import { ref } from "vue";

// Color selection state
const selected = ref<string>("bg-green-600");
const isExpanded = ref(true);

// Available colors
const colors = [
	"bg-green-600",
	"bg-red-600",
	"bg-yellow-300",
	"bg-orange-600",
	"bg-cyan-400",
	"bg-blue-600",
	"bg-purple-600",
	"bg-pink-600",
	"bg-white",
	"bg-black",
];

// Handle color selection
const handleColorSelect = (color: string) => {
	selected.value = color;
};

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
			<span>Colors</span>
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
			<div class="space-2.5 flex grid-cols-5 flex-wrap gap-2.5 md:grid">
				<button
					v-for="(color, index) in colors"
					:key="index"
					type="button"
					:class="
						cn([
							color,
							'flex h-9 w-9 items-center justify-center rounded-full border border-black/20 transition-transform hover:scale-105 sm:h-10 sm:w-10',
						])
					"
					@click="handleColorSelect(color)"
				>
					<Check v-if="selected === color" class="text-base text-white" />
				</button>
			</div>
		</div>
	</div>
</template>
