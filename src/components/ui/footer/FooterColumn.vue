<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<div data-slot="footer-column" :class="cn('flex flex-col gap-4', props.class)">
		<slot />
	</div>
</template>
