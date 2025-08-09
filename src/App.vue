<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/use-auth-store";

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
	<router-view v-slot="{ Component }">
		<transition name="fade" mode="out-in">
			<div :key="$route.fullPath">
				<component :is="Component" />
			</div>
		</transition>
	</router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
