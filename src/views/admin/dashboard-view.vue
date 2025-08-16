<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerAxiosConfig } from "@/constant";
import { fetchOrdersData, getDefaultData, getDefaultOptions } from "@/services/ChartConfig.ts";
import axios from "axios";
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { computed, onMounted, ref } from "vue";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Reactive data
const chartData = ref(getDefaultData());
const isLoading = ref(true);
const stats = ref({
	totalOrders: 0,
	totalProducts: 0,
	totalUsers: 0,
	totalRevenue: 0,
});

// Fetch all data
const fetchDashboardData = async () => {
	try {
		isLoading.value = true;
		const baseURL = ServerAxiosConfig.baseURL || "http://localhost:3000";

		// Fetch orders data for chart
		const monthlySales = await fetchOrdersData();

		// Update chart data
		chartData.value = {
			...getDefaultData(),
			datasets: [
				{
					...getDefaultData().datasets[0],
					data: monthlySales.map((item) => item.total),
				},
			],
		};

		// Fetch stats data
		const [ordersRes, productsRes, usersRes] = await Promise.all([
			axios.get(`${baseURL}/orders`),
			axios.get(`${baseURL}/products`),
			axios.get(`${baseURL}/users`),
		]);

		const orders = ordersRes.data;
		const products = productsRes.data;
		const users = usersRes.data;

		// Calculate total revenue
		const totalRevenue = orders.reduce(
			(sum: number, order: { total: number }) => sum + order.total,
			0,
		);

		// Update stats
		stats.value = {
			totalOrders: orders.length,
			totalProducts: products.length,
			totalUsers: users.length,
			totalRevenue,
		};
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
	} finally {
		isLoading.value = false;
	}
};

// Chart options
const chartOptions = computed(() => ({
	...getDefaultOptions(),
	plugins: {
		...getDefaultOptions().plugins,
		title: {
			...getDefaultOptions().plugins.title,
			text: `Monthly Sales Overview - ${new Date().getFullYear()}`,
		},
	},
}));

// Load data on mount
onMounted(() => {
	fetchDashboardData();
});
</script>

<template>
	<div class="space-y-6">
		<div class="relative my-4 rounded-xl">
			<div class="h-64 overflow-hidden rounded-xl">
				<img
					src="@/assets/images/top-header.png"
					alt="Dashboard"
					class="animated-scaleX -z-10 h-64 w-full object-fill"
				/>
			</div>
			<div class="absolute inset-0 left-8 flex items-center">
				<div class="mb-10 flex flex-col justify-between">
					<h1 class="text-4xl font-bold text-white">Dashboard</h1>
					<p class="mt-2 text-balance text-white">
						Welcome to your clothing store management dashboard. Monitor sales, inventory, and
						customer trends to optimize your fashion business performance.
					</p>
				</div>
			</div>
			<div class="hidden lg:block">
				<!-- Stats Cards -->
				<div
					class="absolute right-4 -bottom-10 left-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
				>
					<div class="overflow-hidden rounded-lg bg-white shadow">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg
										class="h-6 w-6 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
										/>
									</svg>
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="truncate text-sm font-medium text-gray-500">Total Orders</dt>
										<dd class="text-lg font-medium text-gray-900">
											{{ isLoading ? "..." : stats.totalOrders }}
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="overflow-hidden rounded-lg bg-white shadow">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg
										class="h-6 w-6 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/>
									</svg>
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="truncate text-sm font-medium text-gray-500">Total Products</dt>
										<dd class="text-lg font-medium text-gray-900">
											{{ isLoading ? "..." : stats.totalProducts }}
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="overflow-hidden rounded-lg bg-white shadow">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg
										class="h-6 w-6 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
										/>
									</svg>
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="truncate text-sm font-medium text-gray-500">Total Users</dt>
										<dd class="text-lg font-medium text-gray-900">
											{{ isLoading ? "..." : stats.totalUsers }}
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="overflow-hidden rounded-lg bg-white shadow">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg
										class="h-6 w-6 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
										/>
									</svg>
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="truncate text-sm font-medium text-gray-500">Revenue</dt>
										<dd class="text-lg font-medium text-gray-900">
											{{ isLoading ? "..." : `$${stats.totalRevenue.toLocaleString()}` }}
										</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Chart Section -->
		<div class="container mx-auto mt-8 lg:mt-18">
			<Card>
				<CardHeader>
					<CardTitle>Sales Analytics</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="relative h-80 w-full">
						<div v-if="isLoading" class="flex h-full items-center justify-center">
							<div class="text-center">
								<div
									class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
								></div>
								<p class="text-gray-500">Loading chart data...</p>
							</div>
						</div>
						<Line v-else :data="chartData" :options="chartOptions" class="absolute inset-0" />
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</template>

<style scoped>
@keyframes animScale {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.175);
	}
	100% {
		transform: scale(1);
	}
}

.animated-scaleX {
	animation: animScale 45s 1s ease-in-out infinite;
}
</style>
