<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Review } from "@/types/reviews";
import data from "@/../data.json";
import axios from "axios";
import { ServerAxiosConfig } from "@/constant";
import { toast } from "vue-sonner";
import { Motion } from "motion-v";
import type { Product, User, Order } from "@/types";
import Rating from "@/components/ui/Rating.vue";

// Lấy tất cả reviews từ data.json
const reviews = ref<Review[]>([]);

onMounted(() => {
	// Lấy tất cả reviews từ data.json và convert types để phù hợp với Review interface
	reviews.value = (data.reviews || []).map(review => ({
		...review,
		productId: review.productId.toString(),
		userId: review.userId.toString(),
		orderId: review.orderId.toString(),
		images: review.images || []
	}));
});

const replyModalOpen = ref(false);
const replyContent = ref("");
const selectedReview = ref<Review | null>(null);

// Lọc theo số sao
const selectedStar = ref<number | "">("");
// Lọc theo đơn hàng
const selectedOrderId = ref<string | "">("");
// Sắp xếp theo ngày
const sortOrder = ref<"newest" | "oldest">("newest");

// Map userId -> user
const userMap = computed(() => {
	const map: Record<string, User> = {};
	data.users.forEach((u) => (map[u.id] = { ...u, id: parseInt(u.id) || 0 }));
	return map;
});

// Map productId -> product
const productMap = computed(() => {
	const map: Record<string, Product> = {};
	data.products.forEach((p) => (map[p.id] = { ...p, id: parseInt(p.id) || 0 }));
	return map;
});

// Map orderId -> order
const orderMap = computed(() => {
	const map: Record<string, Order> = {};
	data.orders.forEach((o) => (map[o.id.toString()] = { ...o, id: o.id }));
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
	const filtered = (reviews.value || []).filter((r) => {
		const matchStar = selectedStar.value === "" || r.rating === selectedStar.value;
		const matchOrder = selectedOrderId.value === "" || r.orderId === selectedOrderId.value;
		return matchStar && matchOrder;
	});
	
	// Sắp xếp theo ngày tạo
	return filtered.sort((a, b) => {
		const dateA = new Date(a.createdAt).getTime();
		const dateB = new Date(b.createdAt).getTime();
		return sortOrder.value === "newest" ? dateB - dateA : dateA - dateB;
	});
});

// Mở modal trả lời
function openReplyModal(review: Review) {
	selectedReview.value = review;
	replyContent.value = review.reply || "";
	replyModalOpen.value = true;
}

// Gửi phản hồi (thực tế nên gọi API)
async function submitReply() {
	if (!selectedReview.value) return;
	
	try {
		// Gọi API để cập nhật reply
		await axios.patch(`${ServerAxiosConfig.baseURL}/reviews/${selectedReview.value.id}`, {
			reply: replyContent.value,
			replyDate: new Date().toISOString(),
		});
		
		// Cập nhật review trong local state ngay lập tức
		const index = reviews.value.findIndex(r => r.id === selectedReview.value?.id);
		if (index !== -1) {
			reviews.value[index] = {
				...reviews.value[index],
				reply: replyContent.value,
				replyDate: new Date().toISOString()
			};
		}
		
		toast.success("Reply sent successfully!");
		replyModalOpen.value = false;
		replyContent.value = "";
		selectedReview.value = null;
	} catch (error) {
		console.error("Error submitting reply:", error);
		toast.error("Failed to send reply!");
	}
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
			<select v-model="sortOrder" class="rounded border px-2 py-1">
				<option value="newest">Newest First</option>
				<option value="oldest">Oldest First</option>
			</select>
		</div>
		
		<!-- Summary -->
		<div class="mb-4 text-sm text-gray-600">
			Showing {{ filteredReviews.length }} reviews
			<span v-if="selectedStar !== ''"> • {{ selectedStar }} stars</span>
			<span v-if="selectedOrderId !== ''"> • Order {{ orderMap[selectedOrderId]?.orderNumber || selectedOrderId }}</span>
			<span> • {{ sortOrder === 'newest' ? 'Newest first' : 'Oldest first' }}</span>
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
						<th class="px-4 py-2">Images</th>
						<th class="px-4 py-2">Date</th>
						<th class="px-4 py-2">Status</th>
						<th class="px-4 py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(review, index) in filteredReviews" :key="review.id" class="hover:bg-gray-50">
						<td class="px-4 py-2 text-center">{{ index + 1 }}</td>
						<td class="px-4 py-2 max-w-xs truncate" :title="productMap[review.productId]?.name || review.productId">
							{{ productMap[review.productId]?.name || review.productId }}
						</td>
						<td class="px-4 py-2 max-w-xs truncate" :title="userMap[review.userId]?.username || review.userId">
							{{ userMap[review.userId]?.username || review.userId }}
						</td>
						<td class="px-4 py-2 max-w-xs truncate" :title="orderMap[review.orderId]?.orderNumber || review.orderId">
							{{ orderMap[review.orderId]?.orderNumber || review.orderId }}
						</td>
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
						<td class="px-4 py-2">
							<div v-if="review.images && review.images.length > 0" class="flex flex-wrap gap-1">
								<div
									v-for="(image, imgIndex) in review.images"
									:key="imgIndex"
									class="relative"
								>
									<img
										:src="image"
										alt="Review image"
										class="h-10 w-10 rounded object-cover border border-gray-200"
									/>
								</div>
							</div>
							<span v-else class="text-gray-400 text-xs">No images</span>
						</td>
						<td class="px-4 py-2 text-sm">{{ new Date(review.createdAt).toLocaleDateString() }}</td>
						<td class="px-4 py-2">
							<span v-if="review.reply" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Đã reply
							</span>
							<span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								Chưa reply
							</span>
						</td>
						<td class="px-4 py-2">
							<button 
								class="text-blue-600 hover:text-blue-900 font-medium text-sm" 
								@click="openReplyModal(review)"
							>
								{{ review.reply ? 'Edit Reply' : 'Reply' }}
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
			<div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg" @click.stop>
				<h2 class="mb-4 text-lg font-semibold">Reply to Review</h2>
				
				<!-- Review Content -->
				<div class="mb-4">
					<p class="mb-2 font-medium text-gray-700">Review Content:</p>
					<div class="rounded bg-gray-100 p-3 whitespace-pre-line text-gray-800">
						{{ selectedReview?.content }}
					</div>
				</div>

				<!-- Review Images -->
				<div v-if="selectedReview?.images && selectedReview.images.length > 0" class="mb-4">
					<p class="mb-2 font-medium text-gray-700">Review Images:</p>
					<div class="flex flex-wrap gap-2">
						<div
							v-for="(image, index) in selectedReview.images"
							:key="index"
							class="relative"
						>
							<img
								:src="image"
								alt="Review image"
								class="h-24 w-24 rounded object-cover border border-gray-200"
							/>
						</div>
					</div>
				</div>

				<!-- Review Details -->
				<div class="mb-4 grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="font-medium text-gray-700">Product:</span>
						<span class="ml-2 text-gray-600">{{ productMap[selectedReview?.productId || '']?.name || selectedReview?.productId }}</span>
					</div>
					<div>
						<span class="font-medium text-gray-700">User:</span>
						<span class="ml-2 text-gray-600">{{ userMap[selectedReview?.userId || '']?.username || selectedReview?.userId }}</span>
					</div>
					<div>
						<span class="font-medium text-gray-700">Rating:</span>
						<span class="ml-2 text-gray-600">
							<Rating
								:initial-value="selectedReview?.rating || 0"
								:allow-fraction="true"
								svg-class-name="inline-block"
								empty-class-name="fill-gray-50"
								:size="16"
								:readonly="true"
							/>
						</span>
					</div>
					<div>
						<span class="font-medium text-gray-700">Date:</span>
						<span class="ml-2 text-gray-600">{{ selectedReview?.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : '-' }}</span>
					</div>
				</div>

				<!-- Current Reply -->
				<div v-if="selectedReview?.reply" class="mb-4">
					<p class="mb-2 font-medium text-gray-700">Current Reply:</p>
					<div class="flex justify-between rounded bg-green-100 p-3 whitespace-pre-line text-gray-800">
						<p>{{ selectedReview.reply }}</p>
						<p class="text-xs text-gray-500">
							{{ selectedReview.replyDate ? new Date(selectedReview.replyDate).toLocaleDateString() : '-' }}
						</p>
					</div>
				</div>

				<!-- Reply Input -->
				<div class="mb-4">
					<p class="mb-2 font-medium text-gray-700">Your Reply:</p>
					<textarea
						v-model="replyContent"
						rows="4"
						class="w-full rounded border p-3 focus:border-blue-500 focus:ring-blue-500"
						placeholder="Enter your reply..."
					/>
				</div>

				<!-- Action Buttons -->
				<div class="flex justify-end space-x-2">
					<button 
						class="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 transition-colors" 
						@click="replyModalOpen = false"
					>
						Cancel
					</button>
					<button 
						class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors" 
						@click="submitReply"
					>
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
	width: 100%;
}

th,
td {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 0.5rem;
}

/* Responsive table */
@media (max-width: 1024px) {
	table {
		font-size: 0.875rem;
	}
	
	th, td {
		padding: 0.375rem;
	}
}

/* Hover effect for table rows */
tbody tr:hover {
	background-color: #f9fafb;
}

/* Status badges */
.status-badge {
	display: inline-flex;
	align-items: center;
	padding: 0.25rem 0.5rem;
	border-radius: 9999px;
	font-size: 0.75rem;
	font-weight: 500;
}

/* Image thumbnails */
.image-thumbnail {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 0.25rem;
	object-fit: cover;
	border: 1px solid #e5e7eb;
}
</style>
