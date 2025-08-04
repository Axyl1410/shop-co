<script setup lang="ts">
import { watch } from 'vue';
import { useAuthStore } from './stores/use-auth-store';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

watch(
	() => route.params.id,
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
	<RouterView />
</template>
