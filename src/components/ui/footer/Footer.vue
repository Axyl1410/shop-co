<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<div data-slot="footer" :class="cn('bg-background text-foreground pt-12 pb-4', props.class)">
		<slot />
	</div>
</template>
