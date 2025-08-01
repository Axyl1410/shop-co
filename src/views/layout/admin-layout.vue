<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import "vue-sonner/style.css";

const authStore = useAuthStore();
const route = useRoute();
const { user } = storeToRefs(authStore);

// Check if user is admin
const isAdmin = computed(() => user.value?.role === "admin");

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
	<div vaul-drawer-wrapper id="admin-app" class="min-h-screen bg-gray-50">
		<Toaster close-button />

		<!-- Admin Header -->
		<header class="border-b bg-white shadow-sm">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 items-center justify-between">
					<div class="flex items-center">
						<h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
					</div>
					<div class="flex items-center space-x-4">
						<span class="text-sm text-gray-500">Welcome, {{ user?.firstName || "Admin" }}</span>
						<button @click="authStore.logout()" class="text-sm text-red-600 hover:text-red-800">
							Logout
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- Admin Navigation -->
		<nav class="border-b bg-white shadow-sm">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex space-x-8">
					<RouterLink
						to="/admin/dashboard"
						class="border-b-2 px-3 py-4 text-sm font-medium transition-colors"
						:class="
							route.path === '/admin/dashboard'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						"
					>
						Dashboard
					</RouterLink>
					<RouterLink
						to="/admin/products"
						class="border-b-2 px-3 py-4 text-sm font-medium transition-colors"
						:class="
							route.path.startsWith('/admin/products')
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						"
					>
						Products
					</RouterLink>
					<RouterLink
						to="/admin/orders"
						class="border-b-2 px-3 py-4 text-sm font-medium transition-colors"
						:class="
							route.path.startsWith('/admin/orders')
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						"
					>
						Orders
					</RouterLink>
					<RouterLink
						to="/admin/users"
						class="border-b-2 px-3 py-4 text-sm font-medium transition-colors"
						:class="
							route.path.startsWith('/admin/users')
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						"
					>
						Users
					</RouterLink>
					<RouterLink
						to="/admin/settings"
						class="border-b-2 px-3 py-4 text-sm font-medium transition-colors"
						:class="
							route.path.startsWith('/admin/settings')
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'
						"
					>
						Settings
					</RouterLink>
				</div>
			</div>
		</nav>

		<!-- Admin Content -->
		<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
			<RouterView />
		</main>
	</div>
</template>
