<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Button } from '../ui/button'
</script>

<template>
	<div class="bg-black px-2 py-2 text-center text-white sm:px-4 xl:px-0">
		<div class="relative container mx-auto">
			<p class="text-xs sm:text-sm">
				Sign up and get 20% off to your first order.
				<a href="/login" class="font-medium underline"> Sign Up Now </a>
			</p>
			<Button
				variant="ghost"
				class="absolute top-1/2 right-0 hidden h-fit w-fit -translate-y-1/2 p-1 hover:bg-transparent hover:text-white sm:flex"
				size="icon"
				type="button"
				aria-label="close banner"
			>
				<X />
			</Button>
		</div>
	</div>
</template>
