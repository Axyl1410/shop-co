<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { Sliders } from "lucide-vue-next";
import FilterPanel from "../filter-panel.vue";
</script>

<template>
	<Drawer>
		<DrawerTrigger>
			<Button variant="secondary" class="rounded-full !px-3 !py-4">
				<Sliders />
			</Button>
		</DrawerTrigger>
		<DrawerContent>
			<DrawerHeader>
				<div class="flex w-full items-center justify-between">
					<span class="text-xl font-bold text-black">Filters</span>
					<Sliders class="text-2xl text-black/40" />
				</div>
			</DrawerHeader>
			<div class="mb-8 flex flex-col gap-4 overflow-y-auto px-4">
				<FilterPanel />
			</div>
		</DrawerContent>
	</Drawer>
</template>
