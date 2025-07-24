<script setup lang="ts">
import { Motion } from "motion-v";
import DressStyleCard from "./dress-style-card.vue";
</script>

<template>
	<div class="px-4 xl:px-0">
		<section
			class="container mx-auto rounded-[40px] bg-[#F0F0F0] px-6 pt-10 pb-6 text-center md:p-[70px]"
		>
			<Motion
				:initial="{ y: '100px', opacity: 0 }"
				:while-in-view="{ y: '0', opacity: 1 }"
				:in-view-options="{ once: true }"
				:transition="{ duration: 0.6 }"
				class="font-integralCF mb-8 text-[32px] leading-[36px] capitalize md:mb-14 md:text-5xl"
			>
				BROWSE BY dress STYLE
			</Motion>

			<Motion
				:initial="{ y: '100px', opacity: 0 }"
				:while-in-view="{ y: '0', opacity: 1 }"
				:in-view-options="{ once: true }"
				:transition="{ delay: 0.6, duration: 0.6 }"
				class="mb-4 flex flex-col space-y-4 sm:mb-5 sm:flex-row sm:space-y-0 sm:space-x-5 md:h-[289px]"
			>
				<DressStyleCard
					title="Casual"
					url="/shop#casual"
					className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/src/assets/images/dress-style-1.png')]"
				/>
				<DressStyleCard
					title="Formal"
					url="/shop#formal"
					className="md:max-w-[684px] h-[190px] bg-[url('/src/assets/images/dress-style-2.png')]"
				/>
			</Motion>

			<Motion
				:initial="{ y: '100px', opacity: 0 }"
				:while-in-view="{ y: '0', opacity: 1 }"
				:in-view-options="{ once: true }"
				:transition="{ delay: 1, duration: 0.6 }"
				class="flex flex-col space-y-5 sm:flex-row sm:space-y-0 sm:space-x-5 md:h-[289px]"
			>
				<DressStyleCard
					title="Party"
					url="/shop#party"
					className="md:max-w-[684px] h-[190px] bg-[url('/src/assets/images/dress-style-3.png')]"
				/>
				<DressStyleCard
					title="Gym"
					url="/shop#gym"
					className="md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px] h-[190px] bg-[url('/src/assets/images/dress-style-4.png')]"
				/>
			</Motion>
		</section>
	</div>
</template>
