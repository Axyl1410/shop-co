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
		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
				<div :key="$route.path">
					<component :is="Component" />
				</div>
			</transition>
		</router-view>
		<Footer />
	</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
