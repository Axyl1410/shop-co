<script setup lang="ts">
import { ref, computed } from "vue";
import { useReviews } from "@/hook/use-reviews";
import type { Review } from "@/types/reviews";
import data from "@/../data.json";
import axios from "axios";
import { ServerAxiosConfig } from "@/constant";
import { toast } from "vue-sonner";
import { Motion } from "motion-v";
import type { Product, User } from "@/types";
import Rating from "@/components/ui/Rating.vue";

const { reviews, isLoading } = useReviews();

const replyModalOpen = ref(false);
const replyContent = ref("");
const selectedReview = ref<Review | null>(null);

// Lọc theo số sao
const selectedStar = ref<number | "">("");
// Lọc theo đơn hàng
const selectedOrderId = ref<number | "">("");

// Map userId -> user
const userMap = computed(() => {
	const map: Record<string, User> = {};
	data.users.forEach((u) => (map[+u.id] = { ...u, id: +u.id }));
	return map;
});

// Map productId -> product
const productMap = computed(() => {
	const map: Record<number, Product> = {};
	data.products.forEach((p) => (map[+p.id] = { ...p, id: +p.id }));
	return map;
});

// Map orderId -> order
const orderMap = computed(() => {
	const map: Record<number, any> = {};
	data.orders.forEach((o) => (map[+o.id] = o));
	return map;
});

// Danh sách order cho filter
const orderOptions = computed(() => {
	return data.orders.map((o) => ({
		id: o.id,
		orderNumber: o.orderNumber,
	}));
});

// Danh sách số sao cho filter
const starOptions = [5, 4, 3, 2, 1];

// Lọc reviews
const filteredReviews = computed(() => {
	return (reviews.value || []).filter((r) => {
		const matchStar = selectedStar.value === "" || r.rating === selectedStar.value;
		const matchOrder = selectedOrderId.value === "" || r.orderId === selectedOrderId.value;
		return matchStar && matchOrder;
	});
});

// Mở modal trả lời
function openReplyModal(review: Review) {
	selectedReview.value = review;
	replyContent.value = "";
	replyModalOpen.value = true;
}

// Gửi phản hồi (thực tế nên gọi API)
async function submitReply() {
	if (!selectedReview.value) return;
	try {
		await axios.patch(`${ServerAxiosConfig.baseURL}/reviews/${selectedReview.value.id}`, {
			reply: replyContent.value,
            replyDate: new Date().toISOString(),
		});
		toast.success("Reply sent successfully!");
		// Nếu cần, reload lại reviews ở đây
	} catch (error) {
		toast.error("Failed to send reply!");
	}
	replyModalOpen.value = false;
}
</script>

<template>
	<div class="space-y-6">
		<h1 class="text-2xl font-bold text-gray-900">Reviews Management</h1>
		<div class="mb-4 flex gap-4">
			<select v-model="selectedStar" class="rounded border px-2 py-1">
				<option value="">All Stars</option>
				<option v-for="star in starOptions" :key="star" :value="star">{{ star }} Stars</option>
			</select>
			<select v-model="selectedOrderId" class="rounded border px-2 py-1">
				<option value="">All Orders</option>
				<option v-for="order in orderOptions" :key="order.id" :value="order.id">
					{{ order.orderNumber }}
				</option>
			</select>
		</div>
		<div class="overflow-auto rounded-lg bg-white shadow" style="max-height: 70vh">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="sticky top-0 z-10 bg-gray-50">
					<tr>
						<th class="px-4 py-2">No</th>
						<th class="px-4 py-2">Product</th>
						<th class="px-4 py-2">User</th>
						<th class="px-4 py-2">Order</th>
						<th class="px-4 py-2">Rating</th>
						<th class="px-4 py-2">Content</th>
						<!-- <th class="px-4 py-2">Reply</th> -->
						<!-- Thêm cột này -->
						<th class="px-4 py-2">Date</th>
						<th class="px-4 py-2">Status</th>
						<th class="px-4 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(review, index) in filteredReviews" :key="review.id">
						<td class="px-4 py-2">{{ index + 1 }}</td>
						<td class="px-4 py-2">{{ productMap[review.productId]?.name || review.productId }}</td>
						<td class="px-4 py-2">{{ userMap[review.userId]?.username || review.userId }}</td>
						<td class="px-4 py-2">{{ orderMap[review.orderId]?.orderNumber || review.orderId }}</td>
						<td class="px-4 py-2">
							<Rating
								:initial-value="review.rating"
								:allow-fraction="true"
								svg-class-name="inline-block"
								empty-class-name="fill-gray-50"
								:size="19"
								:readonly="true"
							/>
						</td>
						<td class="max-w-xs truncate px-4 py-2" :title="review.content">
							{{ review.content }}
						</td>
						<!-- <td class="max-w-xs truncate px-4 py-2" :title="review.reply">
							{{ review.reply || "-" }}
						</td> -->
						<!-- Nội dung reply -->
						<td class="px-4 py-2">{{ new Date(review.createdAt).toLocaleDateString() }}</td>
						<td class="px-4 py-2">
							<span v-if="review.reply" class="font-semibold text-green-600">Đã reply</span>
							<span v-else class="text-gray-400">Chưa reply</span>
						</td>
						<td class="px-4 py-2">
							<button class="text-blue-600 hover:text-blue-900" @click="openReplyModal(review)">
								Reply
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Modal trả lời review với Motion -->
		<Motion
			v-if="replyModalOpen"
			:initial="{ opacity: 0, scale: 0.9 }"
			:animate="{ opacity: 1, scale: 1 }"
			:exit="{ opacity: 0, scale: 0.9 }"
			:transition="{ duration: 0.3 }"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
		>
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg" @click.stop>
				<h2 class="mb-4 text-lg font-semibold">Reply to Review</h2>
				<p class="mb-2 font-medium text-gray-700">Review Content:</p>
				<div class="mb-4 rounded bg-gray-100 p-2 whitespace-pre-line text-gray-800">
					{{ selectedReview?.content }}
				</div>
				<p class="mb-2 font-medium text-gray-700">Your Reply:</p>
				<!-- Hiển thị nội dung reply nếu đã có -->

				<div
					class="mb-4 flex justify-between rounded bg-green-100 p-2 whitespace-pre-line text-gray-800"
				>
					<p>{{ selectedReview?.reply || "-" }}</p>
					<p>
						{{
							selectedReview?.replyDate
								? new Date(selectedReview.replyDate).toLocaleDateString()
								: "-"
						}}
					</p>
				</div>
				<textarea
					v-model="replyContent"
					rows="4"
					class="mb-4 w-full rounded border p-2"
					placeholder="Enter your reply..."
				/>
				<div class="flex justify-end space-x-2">
					<button class="rounded bg-gray-300 px-4 py-2" @click="replyModalOpen = false">
						Cancel
					</button>
					<button class="rounded bg-blue-600 px-4 py-2 text-white" @click="submitReply">
						Save Reply
					</button>
				</div>
			</div>
		</Motion>
	</div>
</template>

<style scoped>
/* Giới hạn chiều cao bảng và cho phép cuộn */
table {
	table-layout: fixed;
}
th,
td {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
