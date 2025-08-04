<script setup lang="ts">
import Footer from "@/components/layout/footer.vue";
import Navbar from "@/components/layout/navbar/navbar.vue";
import TopBanner from "@/components/layout/top-banner.vue";
import { Toaster } from "@/components/ui/sonner";
import { RouterView } from "vue-router";
import "vue-sonner/style.css";
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
