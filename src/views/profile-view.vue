<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const currentUserId = Number(localStorage.getItem("currentUserId"));
const user = ref(null);
const ordersCount = ref(0);

onMounted(async () => {
  const res = await fetch("/data.json");
  const data = await res.json();
  // Đảm bảo id là số để so sánh đúng
  user.value = data.users.find(u => Number(u.id) === currentUserId);
  ordersCount.value = data.orders.filter(o => Number(o.userId) === currentUserId).length;
});

const vipLevel = computed(() => {
  if (ordersCount.value >= 20) return "Gold";
  if (ordersCount.value >= 10) return "Silver";
  return "Bronze";
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col items-center py-10">
    <h1 class="text-4xl font-bold mb-8">Account</h1>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
        <div>
          <div v-if="user" class="text-3xl font-extrabold mb-2">
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
        <button class="border rounded-lg px-6 py-3 text-xl font-semibold hover:bg-gray-100 flex items-center gap-2">
          Order History
          <span>➔</span>
        </button>
      </div>
      <div class="grid gap-4">
        <button class="flex items-center justify-between border rounded-lg px-6 py-4 text-lg font-semibold hover:bg-gray-100 w-full">
          <span class="flex items-center gap-2"><span>📍</span>Addresses</span>
          <span>➔</span>
        </button>
        <button class="flex items-center justify-between border rounded-lg px-6 py-4 text-lg font-semibold hover:bg-gray-100 w-full">
          <span class="flex items-center gap-2"><span>❓</span>FAQ & Policies</span>
          <span>➔</span>
        </button>
        <button class="flex items-center justify-between border rounded-lg px-6 py-4 text-lg font-semibold hover:bg-gray-100 w-full">
          <span class="flex items-center gap-2"><span>⭐</span>Reviews & Feedback</span>
          <span>➔</span>
        </button>
        <button class="flex items-center justify-between border rounded-lg px-6 py-4 text-lg font-semibold hover:bg-gray-100 w-full">
          <span class="flex items-center gap-2"><span>⏻</span>Log Out</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  </div>
</template>

