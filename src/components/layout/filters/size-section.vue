<script setup lang="ts">
import { cn } from "@/lib/utils";
import { ref } from "vue";

// Size selection state
const selected = ref<string>("Large");
const isExpanded = ref(true);

// Available sizes
const sizes = [
	"XX-Small",
	"X-Small",
	"Small",
	"Medium",
	"Large",
	"X-Large",
	"XX-Large",
	"3X-Large",
	"4X-Large",
];

// Handle size selection
const handleSizeSelect = (size: string) => {
	selected.value = size;
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
			<span>Size</span>
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
			<div class="flex flex-wrap items-center">
				<button
					v-for="(size, index) in sizes"
					:key="index"
					type="button"
					:class="
						cn([
							'm-1 flex max-h-[39px] items-center justify-center rounded-full bg-[#F0F0F0] px-5 py-2.5 text-sm transition-colors hover:bg-gray-200',
							selected === size && 'bg-black font-medium text-white hover:bg-black',
						])
					"
					@click="handleSizeSelect(size)"
				>
					{{ size }}
				</button>
			</div>
		</div>
	</div>
</template>
