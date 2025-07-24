<script setup lang="ts">
import bigStarIcon from "@/assets/icons/big-star.svg";
import smallStarIcon from "@/assets/icons/small-star.svg";
import headerResImage from "@/assets/images/header-res-homepage.png";
import AnimatedCounter from "@/components/ui/AnimatedCounter.vue";
import { Separator } from "@/components/ui/separator";
import { Motion } from "motion-v";
</script>

<template>
	<header class="overflow-hidden bg-[#F2F0F1] pt-10 md:pt-24">
		<div class="mx-auto grid grid-cols-1 md:container md:grid-cols-2 lg:grid-cols-2">
			<section class="container mx-auto px-4">
				<Motion
					:initial="{ y: '100px', opacity: 0, rotate: 10 }"
					:while-in-view="{ y: '0', opacity: 1, rotate: 0 }"
					:in-view-options="{ once: true }"
					:transition="{ duration: 0.6 }"
					class="font-integralCF mb-5 text-4xl lg:mb-8 lg:text-[64px] lg:leading-[64px]"
				>
					FIND CLOTHES THAT MATCHES YOUR STYLE
				</Motion>

				<Motion
					:initial="{ y: '100px', opacity: 0 }"
					:while-in-view="{ y: '0', opacity: 1 }"
					:in-view-options="{ once: true }"
					:transition="{ delay: 0.5, duration: 0.6 }"
					class="mb-6 max-w-[545px] text-sm text-black/60 lg:mb-8 lg:text-base"
				>
					Browse through our diverse range of meticulously crafted garments, designed to bring out
					your individuality and cater to your sense of style.
				</Motion>

				<Motion
					:initial="{ y: '100px', opacity: 0 }"
					:while-in-view="{ y: '0', opacity: 1 }"
					:in-view-options="{ once: true }"
					:transition="{ delay: 1, duration: 0.6 }"
				>
					<router-link
						to="/shop"
						class="mb-5 inline-block w-full rounded-full bg-black px-14 py-4 text-center text-white transition-all hover:animate-pulse hover:bg-black/80 md:mb-12 md:w-52"
					>
						Shop Now
					</router-link>
				</Motion>

				<Motion
					:initial="{ y: '100px', opacity: 0 }"
					:while-in-view="{ y: '0', opacity: 1 }"
					:in-view-options="{ once: true }"
					:transition="{ delay: 1.5, duration: 0.6 }"
					class="flex flex-wrap items-center justify-center sm:flex-nowrap md:mb-[116px] md:h-full md:max-h-11 md:justify-start md:space-x-3 lg:max-h-[52px] lg:space-x-6 xl:max-h-[68px] xl:space-x-8"
				>
					<div class="flex flex-col">
						<span class="text-2xl font-bold md:text-xl lg:text-3xl xl:mb-2 xl:text-[40px]">
							<AnimatedCounter :from="0" :to="200" />+
						</span>
						<span class="text-xs text-nowrap text-black/60 xl:text-base">
							International Brands
						</span>
					</div>
					<Separator class="ml-6 h-12 bg-black/10 md:ml-0 md:h-full" orientation="vertical" />
					<div class="ml-6 flex flex-col md:ml-0">
						<span class="text-2xl font-bold md:text-xl lg:text-3xl xl:mb-2 xl:text-[40px]">
							<AnimatedCounter :from="0" :to="2000" />+
						</span>
						<span class="text-xs text-nowrap text-black/60 xl:text-base">
							High-Quality Products
						</span>
					</div>
					<Separator
						class="ml-6 hidden bg-black/10 sm:block sm:h-12 md:ml-0 md:h-full"
						orientation="vertical"
					/>
					<div
						class="mt-3 flex w-full flex-col text-center sm:mt-0 sm:ml-6 sm:w-auto sm:text-left md:ml-0"
					>
						<span class="text-2xl font-bold md:text-xl lg:text-3xl xl:mb-2 xl:text-[40px]">
							<AnimatedCounter :from="0" :to="3000" />+
						</span>
						<span class="text-xs text-nowrap text-black/60 xl:text-base"> Happy Customers </span>
					</div>
				</Motion>
			</section>

			<Motion
				:initial="{ y: '100px', opacity: 0, rotate: 10 }"
				:while-in-view="{ y: '0', opacity: 1, rotate: 0 }"
				:in-view-options="{ once: true }"
				:transition="{ delay: 2.3, duration: 0.8 }"
				class="relative min-h-[448px] bg-cover bg-top bg-no-repeat md:min-h-[428px] md:px-4 xl:bg-[center_top_-1.6rem]"
				:style="{
					backgroundImage: `url(${headerResImage})`,
				}"
			>
				<img
					:src="bigStarIcon"
					alt="big star"
					class="lg:max-h-max-w-24 absolute top-12 right-7 max-h-[76px] max-w-[76px] animate-[spin_4s_infinite] lg:max-w-24 xl:right-0 xl:max-h-[104px] xl:max-w-[104px]"
				/>
				<img
					:src="smallStarIcon"
					alt="small star"
					class="absolute top-36 left-7 max-h-11 max-w-11 animate-[spin_3s_infinite] sm:top-64 md:top-44 md:left-0 md:max-h-14 md:max-w-14 lg:top-56"
				/>
			</Motion>
		</div>
	</header>
</template>
