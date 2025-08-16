<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<div
		data-slot="footer-bottom"
		:class="
			cn(
				'border-border dark:border-border/15 text-muted-foreground mt-8 flex flex-col items-center justify-between gap-4 border-t pt-4 text-xs sm:flex-row',
				props.class,
			)
		"
	>
		<slot />
	</div>
</template>
