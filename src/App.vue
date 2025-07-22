<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
import Footer from "./components/layout/footer.vue";
import Navbar from "./components/layout/navbar.vue";
import TopBanner from "./components/layout/top-banner.vue";
import { onMounted } from "vue";

onMounted(() => {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
});
</script>

<template>
	<Toaster close-button />
	<TopBanner />
	<Navbar />
	<RouterView />
	<Footer />
</template>
