<script setup lang="ts">
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const ordersCount = ref(0);

onMounted(async () => {
	if (!user.value) {
		await authStore.refreshUser();
	}
});

const vipLevel = computed(() => {
	if (ordersCount.value >= 20) return "Gold";
	if (ordersCount.value >= 10) return "Silver";
	return "Bronze";
});
</script>

<template>
	<div class="flex min-h-screen flex-col items-center bg-gray-50 py-10">
		<h1 class="mb-8 text-4xl font-bold">Account</h1>
		<div class="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
			<div class="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div>
					<div v-if="user" class="mb-2 text-3xl font-extrabold">
						{{ user.firstName }} {{ user.lastName }}
					</div>
					<div v-else class="text-lg text-gray-400">Đang tải thông tin...</div>
					<div class="flex flex-col gap-2 text-lg">
						<div class="flex items-center gap-2">
							<span>📞</span>
							<span>{{ user?.phone }}</span>
						</div>
						<div class="flex items-center gap-2">
							<span>🛒</span>
							<span>Orders: {{ ordersCount }}</span>
						</div>
						<div class="flex items-center gap-2">
							<span>✅</span>
							<span>VIP: {{ vipLevel }}</span>
						</div>
					</div>
				</div>
				<button
					class="flex items-center gap-2 rounded-lg border px-6 py-3 text-xl font-semibold hover:bg-gray-100"
				>
					Order History
					<span>➔</span>
				</button>
			</div>
			<div class="grid gap-4">
				<button
					class="flex w-full items-center justify-between rounded-lg border px-6 py-4 text-lg font-semibold hover:bg-gray-100"
				>
					<span class="flex items-center gap-2"><span>📍</span>Addresses</span>
					<span>➔</span>
				</button>
				<button
					class="flex w-full items-center justify-between rounded-lg border px-6 py-4 text-lg font-semibold hover:bg-gray-100"
				>
					<span class="flex items-center gap-2"><span>❓</span>FAQ & Policies</span>
					<span>➔</span>
				</button>
				<button
					class="flex w-full items-center justify-between rounded-lg border px-6 py-4 text-lg font-semibold hover:bg-gray-100"
				>
					<span class="flex items-center gap-2"><span>⭐</span>Reviews & Feedback</span>
					<span>➔</span>
				</button>
				<button
					@click="authStore.logout()"
					class="flex w-full items-center justify-between rounded-lg border px-6 py-4 text-lg font-semibold hover:bg-gray-100"
				>
					<span class="flex items-center gap-2"><span>⏻</span>Log Out</span>
					<span>➔</span>
				</button>
			</div>
		</div>
	</div>
</template>
