<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { defineProps } from "vue";

defineProps<{ totalItems: number }>();
</script>
<template>
	<div class="relative">
		<ShoppingCart class="size-5 md:size-6" />
		<span
			v-if="totalItems > 0"
			class="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
		>
			{{ totalItems }}
		</span>
	</div>
</template>
