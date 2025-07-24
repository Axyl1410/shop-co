<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import "vue-sonner/style.css";
import Footer from "./components/layout/footer.vue";
import Navbar from "./components/layout/navbar/navbar.vue";
import TopBanner from "./components/layout/top-banner.vue";
import { useAuthStore } from "./stores/use-auth-store";

const authStore = useAuthStore();

onMounted(() => {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});

	authStore.initializeAuth();
});
</script>

<template>
	<Toaster close-button />
	<TopBanner />
	<Navbar />
	<RouterView />
	<Footer />
</template>
