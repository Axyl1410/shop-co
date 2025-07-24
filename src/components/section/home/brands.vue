<script setup lang="ts">
import calvinKleinLogo from "@/assets/icons/calvin-klein-logo.svg";
import gucciLogo from "@/assets/icons/gucci-logo.svg";
import pradaLogo from "@/assets/icons/prada-logo.svg";
import versaceLogo from "@/assets/icons/versace-logo.svg";
import zaraLogo from "@/assets/icons/zara-logo.svg";

const brandsData = [
	{ id: "versace", srcUrl: versaceLogo },
	{ id: "zara", srcUrl: zaraLogo },
	{ id: "gucci", srcUrl: gucciLogo },
	{ id: "prada", srcUrl: pradaLogo },
	{ id: "calvin-klein", srcUrl: calvinKleinLogo },
];
</script>

<template>
	<div class="bg-black">
		<div
			class="container mx-auto flex flex-wrap items-center justify-center space-x-7 py-5 sm:px-4 md:justify-between md:py-0 xl:px-0"
		>
			<img
				v-for="brand in brandsData"
				:key="brand.id"
				:src="brand.srcUrl"
				:alt="brand.id"
				class="my-5 h-auto max-h-[26px] w-auto max-w-[116px] md:my-11 lg:max-h-9 lg:max-w-48"
				loading="eager"
			/>
		</div>
	</div>
</template>
