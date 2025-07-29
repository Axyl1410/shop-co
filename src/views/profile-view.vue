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
	<div class="account-container">
		<h1 class="account-title">Account</h1>
		<div class="account-box">
			<div class="account-header">
				<div>
					<div v-if="user" class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
					<div v-else class="loading-text">Đang tải thông tin...</div>
					<div class="user-info">
						<div class="info-item">
							<span>📞</span>
							<span>{{ user?.phone }}</span>
						</div>
						<div class="info-item">
							<span>🛒</span>
							<span>Orders: {{ ordersCount }}</span>
						</div>
						<div class="info-item">
							<span>✅</span>
							<span>VIP: {{ vipLevel }}</span>
						</div>
					</div>
				</div>
				<button class="history-btn">Order History <span>➔</span></button>
			</div>
			<div class="account-actions">
				<button class="action-btn">
					<span class="action-label"><span>📍</span>Addresses</span>
					<span>➔</span>
				</button>
				<button class="action-btn">
					<span class="action-label"><span>❓</span>FAQ & Policies</span>
					<span>➔</span>
				</button>
				<button class="action-btn">
					<span class="action-label"><span>⭐</span>Reviews & Feedback</span>
					<span>➔</span>
				</button>
				<button @click="authStore.logout()" class="action-btn">
					<span class="action-label"><span>⏻</span>Log Out</span>
					<span>➔</span>
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.account-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-height: 100vh;
	background-color: #f9fafb;
	padding: 40px 0;
}

.account-title {
	margin-bottom: 32px;
	font-size: 2.5rem;
	font-weight: bold;
}

.account-box {
	width: 100%;
	max-width: 800px;
	background-color: white;
	padding: 32px;
	border-radius: 16px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.account-header {
	display: flex;
	flex-direction: column;
	gap: 24px;
	margin-bottom: 24px;
}

@media (min-width: 768px) {
	.account-header {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
}

.user-name {
	margin-bottom: 8px;
	font-size: 1.75rem;
	font-weight: 800;
}

.loading-text {
	font-size: 1.125rem;
	color: #9ca3af;
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
	font-size: 1.125rem;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8px;
}

.history-btn {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	font-size: 1.25rem;
	font-weight: 600;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	background-color: transparent;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.history-btn:hover {
	background-color: #f3f4f6;
}

.account-actions {
	display: grid;
	gap: 16px;
}

.action-btn {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 24px;
	font-size: 1.125rem;
	font-weight: 600;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	background-color: transparent;
	cursor: pointer;
	transition: background-color 0.2s ease;
	width: 100%;
}

.action-btn:hover {
	background-color: #f3f4f6;
}

.action-label {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
