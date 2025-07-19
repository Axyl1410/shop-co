<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
import Footer from "./components/layout/footer.vue";
import Navbar from "./components/layout/navbar.vue";
import TopBanner from "./components/layout/top-banner.vue";
</script>

<template>
	<Toaster close-button />
	<TopBanner />
	<Navbar />
	<RouterView />
	<Footer />
</template>
