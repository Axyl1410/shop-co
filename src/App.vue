<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/use-auth-store";
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";

const authStore = useAuthStore();
const route = useRoute();

watch(
	() => route.fullPath,
	() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		authStore.initializeAuth();
	},
	{ immediate: true },
);
</script>

<template>
	<Toaster />
	<RouterView />
</template>
