<script setup lang="ts">
import LoginForm from "@/components/layout/login-form.vue";
import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

if (authStore.isAuthenticated) {
	router.push("/");
}
</script>

<template>
	<div class="flex flex-col items-center justify-center bg-white p-6 md:p-10">
		<div class="w-full max-w-sm md:max-w-3xl">
			<LoginForm />
		</div>
	</div>
</template>
