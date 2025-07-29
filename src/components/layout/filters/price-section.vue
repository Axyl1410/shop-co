<script setup lang="ts">
import { ref } from "vue";

// Price range state
const priceRange = ref([50, 200]);
const isExpanded = ref(true);

// Slider configuration
const sliderConfig = {
	min: 0,
	max: 250,
	step: 1,
};

// Handle price range change
const handlePriceChange = (event: Event, index: number) => {
	const target = event.target as HTMLInputElement;
	const value = parseInt(target.value);
	priceRange.value[index] = value;
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
			<span>Price</span>
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
		<div v-show="isExpanded" class="overflow-visible pt-4">
			<!-- Custom Range Slider -->
			<div class="space-y-4">
				<!-- Price Range Display -->
				<div class="flex justify-between text-sm text-gray-600">
					<span>${{ priceRange[0] }}</span>
					<span>${{ priceRange[1] }}</span>
				</div>

				<!-- Range Inputs -->
				<div class="relative">
					<!-- Track -->
					<div class="relative h-2 rounded-full bg-gray-200">
						<!-- Active Range -->
						<div
							class="absolute h-2 rounded-full bg-blue-500"
							:style="{
								left: `${((priceRange[0] - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100}%`,
								right: `${100 - ((priceRange[1] - sliderConfig.min) / (sliderConfig.max - sliderConfig.min)) * 100}%`,
							}"
						></div>
					</div>

					<!-- Min Range Input -->
					<input
						type="range"
						:min="sliderConfig.min"
						:max="sliderConfig.max"
						:step="sliderConfig.step"
						:value="priceRange[0]"
						@input="(e) => handlePriceChange(e, 0)"
						class="absolute top-0 h-2 w-full cursor-pointer opacity-0"
						:style="{
							zIndex: priceRange[0] > priceRange[1] ? 2 : 1,
						}"
					/>

					<!-- Max Range Input -->
					<input
						type="range"
						:min="sliderConfig.min"
						:max="sliderConfig.max"
						:step="sliderConfig.step"
						:value="priceRange[1]"
						@input="(e) => handlePriceChange(e, 1)"
						class="absolute top-0 h-2 w-full cursor-pointer opacity-0"
						:style="{
							zIndex: priceRange[1] > priceRange[0] ? 2 : 1,
						}"
					/>
				</div>

				<!-- Price Inputs -->
				<div class="flex gap-2">
					<div class="flex-1">
						<label class="mb-1 block text-xs text-gray-500">Min</label>
						<input
							type="number"
							:min="sliderConfig.min"
							:max="sliderConfig.max"
							:value="priceRange[0]"
							@input="(e) => handlePriceChange(e, 0)"
							class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div class="flex-1">
						<label class="mb-1 block text-xs text-gray-500">Max</label>
						<input
							type="number"
							:min="sliderConfig.min"
							:max="sliderConfig.max"
							:value="priceRange[1]"
							@input="(e) => handlePriceChange(e, 1)"
							class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			<div class="mb-3" />
		</div>
	</div>
</template>
