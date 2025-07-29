<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sliders } from "lucide-vue-next";
import FilterPanel from "../filter-panel.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
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
				<div className="flex items-center max-w-[295px] justify-between">
					<span className="font-bold text-black text-xl">Filters</span>
					<Sliders className="text-2xl text-black/40" />
				</div>
			</DrawerHeader>
			<div class="mb-8 flex flex-col gap-4 overflow-y-auto px-4">
				<FilterPanel />
			</div>
		</DrawerContent>
	</Drawer>
</template>
