<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { RouterLink } from "vue-router";
</script>

<template>
	<div
		class="bg-background text-primary grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8"
	>
		<div class="text-center">
			<p class="text-base font-semibold text-indigo-600">404</p>
			<h1 class="text-primary mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
				Page not found
			</h1>
			<p class="text-primary mt-6 text-lg font-medium text-pretty sm:text-xl/8">
				Sorry, we couldn't find the page you're looking for.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<Button as-child> <RouterLink to="/"> Go back home </RouterLink> </Button>
				<Button as-child variant="outline">
					<a
						href="https://github.com/Axyl1410/"
						class="text-primary text-sm font-semibold"
						target="_blank"
					>
						Contact support <span aria-hidden="true">→</span>
					</a></Button
				>
			</div>
		</div>
	</div>
</template>
