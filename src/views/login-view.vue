<script setup lang="ts">
import LoginForm from "@/components/layout/login-form.vue";
import { GalleryVerticalEnd } from "lucide-vue-next";
</script>

<template>
	<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
		<div class="flex w-full max-w-sm flex-col gap-6">
			<a href="#" class="flex items-center gap-2 self-center font-medium">
				<div
					class="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md"
				>
					<GalleryVerticalEnd class="size-4" />
				</div>
				Axyl Team.
			</a>
			<LoginForm />
		</div>
	</div>
</template>
