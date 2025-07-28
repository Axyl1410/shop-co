<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	CategoriesSection,
	ColorsSection,
	DressStyleSection,
	PriceSection,
	SizeSection,
} from "./filters";
</script>

<template>
	<hr className="border-t-black/10" />
	<CategoriesSection />
	<hr className="border-t-black/10" />
	<PriceSection />
	<hr className="border-t-black/10" />
	<ColorsSection />
	<hr className="border-t-black/10" />
	<SizeSection />
	<hr className="border-t-black/10" />
	<DressStyleSection />
	<Button
		type="button"
		className="bg-black w-full rounded-full text-white text-sm font-medium py-4 h-12"
	>
		Apply Filter
	</Button>
</template>
