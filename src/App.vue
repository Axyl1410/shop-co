<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import "vue-sonner/style.css";
import Footer from "./components/layout/footer.vue";
import Navbar from "./components/layout/navbar/navbar.vue";
import TopBanner from "./components/layout/top-banner.vue";
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
	<div vaul-drawer-wrapper id="app" class="bg-white">
		<Toaster close-button />
		<TopBanner />
		<Navbar />
		<RouterView />
		<Footer />
	</div>
</template>
