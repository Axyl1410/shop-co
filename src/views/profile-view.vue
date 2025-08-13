<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/use-auth-store";
import {
	ArrowRight,
	Crown,
	HelpCircle,
	LogOut,
	MapPin,
	PencilLine,
	Phone,
	ShoppingBag,
	Star,
	MessageSquare,
	History,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { Review } from "@/types/reviews";
import data from "@/../data.json";
import { toast } from "vue-sonner";
import Rating from "@/components/ui/Rating.vue";
import { formatDate } from "@/lib/utils";
import HistoryOrder from "@/components/section/profile/history-order.vue";

type MinimalProduct = {
	id: string;
	name: string;
	images?: string[];
	originalPrice?: number;
};

type ProductLike = {
	id: string | number;
	name: string;
	images?: string[];
	originalPrice?: number;
};

type UnreviewedOrderItem = {
	productId: string;
	productName: string;
	productImage: string;
	productPrice?: number;
	product: MinimalProduct;
};

type UnreviewedOrder = {
	id: string;
	orderNumber: string;
	createdAt: string;
	items: UnreviewedOrderItem[];
};

const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const ordersCount = ref(0);

// State
const showHistoryOrder = ref(false);
const showReviewForm = ref(false);
const selectedProduct = ref<MinimalProduct | null>(null);

// Reviews state
const userReviews = ref<Review[]>([]);
const newReview = ref({
	rating: 5,
	title: "",
	content: "",
	images: [] as string[],
});

onMounted(async () => {
	if (!user.value) {
		await authStore.refreshUser();
	}
	// Load user reviews
	loadUserReviews();
});

function toMinimalProduct(p: ProductLike): MinimalProduct {
	return {
		id: p.id.toString(),
		name: p.name,
		images: p.images,
		originalPrice: p.originalPrice,
	};
}

// Load user reviews
function loadUserReviews() {
	if (!user.value) return;
	userReviews.value = (data.reviews || [])
		.filter((review) => review.userId.toString() === user.value?.id.toString())
		.map((review) => ({
			...review,
			productId: review.productId.toString(),
			userId: review.userId.toString(),
			orderId: review.orderId.toString(),
			images: review.images || [],
		}));
}

// Get product name by ID
function getProductName(productId: string) {
	const product = data.products.find((p) => p.id.toString() === productId);
	return product?.name || productId;
}

// Check if user has purchased a product
function hasPurchasedProduct(productId: string) {
	if (!user.value) return false;
	
	return data.orders.some(order => 
		order.userId.toString() === user.value?.id.toString() && 
		order.status === "delivered" && // Chỉ đơn hàng đã giao thành công
		data.order_items.some(item => 
			item.orderId.toString() === order.id.toString() && 
			data.product_variants.some(variant => 
				variant.id.toString() === item.productVariantId.toString() && 
				variant.productId.toString() === productId
			)
		)
	);
}

// Get purchased products that haven't been reviewed
function getUnreviewedProducts() {
	if (!user.value) return [] as MinimalProduct[];
	
	const reviewedProductIds = userReviews.value.map(review => review.productId);
	console.log("Debug - Reviewed product IDs in getUnreviewedProducts:", reviewedProductIds);
	
	const allProducts = data.products.filter(product => {
		const productId = product.id.toString();
		const hasPurchased = hasPurchasedProduct(productId);
		const notReviewed = !reviewedProductIds.includes(productId);
		
		console.log("Debug - Product:", product.name, "ID:", productId, "hasPurchased:", hasPurchased, "notReviewed:", notReviewed);
		
		return hasPurchased && notReviewed;
	});
	
	console.log("Debug - Filtered products count:", allProducts.length);
	return allProducts.map(toMinimalProduct);
}

// Orders that have items not yet reviewed
const unreviewedOrders = computed<UnreviewedOrder[]>(() => {
	if (!user.value) return [];
	
	const userId = user.value.id.toString();
	console.log("Debug - User ID:", userId);
	
	const reviewed = new Set(userReviews.value.map((r) => r.productId.toString()));
	console.log("Debug - Reviewed product IDs:", Array.from(reviewed));
	
	// Chỉ lấy đơn hàng đã giao thành công
	const orders = data.orders.filter((o) => 
		o.userId.toString() === userId && 
		o.status === "delivered"
	);
	console.log("Debug - User delivered orders:", orders.length);
	console.log("Debug - Delivered orders:", orders.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status })));
	
	const groups: UnreviewedOrder[] = orders
		.map((order) => {
			console.log("Debug - Processing delivered order:", order.orderNumber, "ID:", order.id);
			
			const items = data.order_items.filter(
				(oi) => oi.orderId.toString() === order.id.toString()
			);
			console.log("Debug - Order items for", order.orderNumber, ":", items.length);
			console.log("Debug - Order items details:", items.map(item => ({ 
				id: item.id, 
				orderId: item.orderId, 
				productVariantId: item.productVariantId 
			})));
			
			const pending: UnreviewedOrderItem[] = [];
			for (const item of items) {
				console.log("Debug - Processing item:", item.id, "variantId:", item.productVariantId);
				
				const variant = data.product_variants.find(
					(v) => v.id.toString() === item.productVariantId.toString()
				);
				if (!variant) {
					console.log("Debug - No variant found for item:", item);
					continue;
				}
				console.log("Debug - Found variant:", variant.id, "productId:", variant.productId);
				
				const productId = variant.productId.toString();
				console.log("Debug - Product ID from variant:", productId);
				
				if (reviewed.has(productId)) {
					console.log("Debug - Product already reviewed:", productId);
					continue;
				}
				
				const product = data.products.find(
					(p) => p.id.toString() === productId
				);
				
				if (!product) {
					console.log("Debug - No product found for ID:", productId);
					continue;
				}
				console.log("Debug - Found product:", product.name);
				
				const minimal = toMinimalProduct(product);
				pending.push({
					productId,
					productName: product.name,
					productImage: product.images?.[0] || "/placeholder.jpg",
					productPrice: product.originalPrice,
					product: minimal,
				});
				console.log("Debug - Added pending item:", product.name);
			}
			
			console.log("Debug - Pending items for order", order.orderNumber, ":", pending.length);
			
			return {
				id: order.id.toString(),
				orderNumber: order.orderNumber,
				createdAt: order.createdAt,
				items: pending,
			};
		})
		.filter((g) => g.items.length > 0)
		.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	
	console.log("Debug - Final unreviewed orders:", groups.length);
	console.log("Debug - Final groups:", groups.map(g => ({ 
		orderNumber: g.orderNumber, 
		itemsCount: g.items.length,
		items: g.items.map(i => i.productName)
	})));
	return groups;
});

// Open review form for a product
function openReviewForm(product: MinimalProduct) {
	selectedProduct.value = product;
	newReview.value = {
		rating: 5,
		title: "",
		content: "",
		images: [],
	};
	showReviewForm.value = true;
}

// Handle image upload
function handleImageUpload(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		const files = Array.from(target.files);
		const maxImages = 5;
		if (newReview.value.images.length + files.length > maxImages) {
			toast.error(`Bạn chỉ có thể upload tối đa ${maxImages} ảnh`);
			return;
		}
		files.forEach((file) => {
			if (file.type.startsWith("image/")) {
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 5MB`);
					return;
				}
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						newReview.value.images.push(e.target.result as string);
					}
				};
				reader.readAsDataURL(file);
			} else {
				toast.error(`File ${file.name} không phải là ảnh`);
			}
		});
	}
	target.value = "";
}

// Remove image
function removeImage(index: number) {
	newReview.value.images.splice(index, 1);
}

// Submit review
async function submitReview() {
	if (!selectedProduct.value || !user.value) return;
	if (!newReview.value.title.trim()) {
		toast.error("Vui lòng nhập tiêu đề đánh giá");
		return;
	}
	if (!newReview.value.content.trim()) {
		toast.error("Vui lòng nhập nội dung đánh giá");
		return;
	}
	try {
		const reviewData = {
			id: Date.now().toString(),
			productId: selectedProduct.value.id,
			userId: user.value.id.toString(),
			orderId: "1",
			rating: newReview.value.rating,
			title: newReview.value.title,
			content: newReview.value.content,
			images: newReview.value.images,
			variantId: 1,
			variantName: "",
			color: "",
			size: "",
			isVerified: true,
			isHelpful: 0,
			createdAt: new Date().toISOString(),
			reply: "",
			replyDate: "",
		};
		// Update local mocks
		data.reviews.push(reviewData);
		userReviews.value.push(reviewData as Review);
		toast.success("Đánh giá đã được gửi thành công!");
		showReviewForm.value = false;
		selectedProduct.value = null;
	} catch (error) {
		console.error("Error submitting review:", error);
		toast.error("Đã xảy ra lỗi khi gửi đánh giá");
	}
}

const displayName = computed(() => {
	if (!user.value) return "";
	const full = `${user.value.firstName ?? ""} ${user.value.lastName ?? ""}`.trim();
	return full || user.value.username;
});

const initials = computed(() => {
	if (!user.value) return "";
	const first = user.value.firstName?.[0] ?? user.value.username?.[0] ?? "U";
	const last = user.value.lastName?.[0] ?? "";
	return `${first}${last}`.toUpperCase();
});

const formattedJoinDate = computed(() => {
	if (!user.value?.createdAt) return "—";
	const d = new Date(user.value.createdAt);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString();
});

const vipLevel = computed(() => {
	if (ordersCount.value >= 20) return "Gold";
	if (ordersCount.value >= 10) return "Silver";
	return "Bronze";
});

const vipBadgeClass = computed(() => {
	switch (vipLevel.value) {
		case "Gold":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200";
		case "Silver":
			return "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-200";
		default:
			return "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200";
	}
});

const unreviewedProducts = computed(() => getUnreviewedProducts());

function handleLogout() {
	authStore.logout();
	router.push({ name: "home" });
}
</script>

<template>
	<div class="container mx-auto max-w-5xl px-4 py-10">
		<h1 class="mb-6 text-3xl font-bold">Tài khoản</h1>

		<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
			<!-- Profile card -->
			<Card class="overflow-hidden">
				<CardHeader class="border-b">
					<div v-if="user" class="flex items-center gap-4">
						<Avatar class="h-14 w-14 rounded-xl">
							<AvatarImage :src="user.avatar" :alt="displayName" />
							<AvatarFallback class="rounded-xl">{{ initials }}</AvatarFallback>
						</Avatar>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="text-xl font-semibold">{{ displayName }}</span>
								<span
									:class="[
										'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
										vipBadgeClass,
									]"
								>
									<Crown class="size-3" />
									{{ vipLevel }}
								</span>
							</div>
							<p class="text-muted-foreground text-sm">{{ user.email }}</p>
						</div>
						<Button variant="outline" size="sm" class="hidden md:inline-flex">
							<PencilLine class="size-4" />
							Chỉnh sửa
						</Button>
					</div>
					<div v-else class="flex items-center gap-4">
						<Skeleton class="h-14 w-14 rounded-xl" />
						<div class="flex-1 space-y-2">
							<Skeleton class="h-4 w-40" />
							<Skeleton class="h-3 w-64" />
						</div>
					</div>
				</CardHeader>

				<CardContent class="py-6">
					<!-- quick stats -->
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Phone class="size-4" />
								Số điện thoại
							</div>
							<div class="mt-1 font-medium">{{ user?.phone || "—" }}</div>
						</div>
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<ShoppingBag class="size-4" />
								Đơn hàng
							</div>
							<div class="mt-1 font-medium">{{ ordersCount }}</div>
						</div>
						<div class="rounded-lg border p-4">
							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Star class="size-4" />
								Hạng VIP
							</div>
							<div class="mt-1 font-medium">{{ vipLevel }}</div>
						</div>
					</div>

					<Separator class="my-6" />

					<!-- actions -->
					<div class="flex flex-col gap-3">
						<Button variant="outline" class="justify-between" @click="showHistoryOrder = !showHistoryOrder">
							<span class="inline-flex items-center gap-2">
								<History class="size-4" />
								Lịch sử đơn hàng
							</span>
							<ArrowRight class="size-4 opacity-60" :class="{ 'rotate-90': showHistoryOrder }" />
						</Button>
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<MapPin class="size-4" />
								Sổ địa chỉ
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<MessageSquare class="size-4" />
								Đánh giá của tôi
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="outline" class="justify-between">
							<span class="inline-flex items-center gap-2">
								<HelpCircle class="size-4" />
								Câu hỏi & chính sách
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
						<Button variant="destructive" class="justify-between" @click="handleLogout">
							<span class="inline-flex items-center gap-2">
								<LogOut class="size-4" />
								Đăng xuất
							</span>
							<ArrowRight class="size-4 opacity-60" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<!-- Sidebar card -->
			<Card class="h-fit">
				<CardHeader class="border-b">
					<CardTitle>Thông tin nhanh</CardTitle>
				</CardHeader>
				<CardContent class="py-6">
					<div class="space-y-2 text-sm">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Tên đăng nhập</span>
							<span class="font-medium">{{ user?.username || "—" }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Ngày tham gia</span>
							<span class="font-medium">{{ formattedJoinDate }}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Trạng thái</span>
							<span class="font-medium" :class="user?.isActive ? 'text-green-600' : 'text-red-600'">
								{{ user?.isActive ? "Đang hoạt động" : "Ngừng hoạt động" }}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- History Order Section -->
		<div v-if="showHistoryOrder" class="mt-6">
			<HistoryOrder />
		</div>

		<!-- Reviews Section -->
		<div class="mt-8 space-y-6">
			<Card>
				<CardHeader class="border-b">
					<CardTitle class="flex items-center gap-2">
						<MessageSquare class="size-5" />
						Đánh giá của tôi
					</CardTitle>
				</CardHeader>
				<CardContent class="py-6">
					<!-- User Reviews -->
					<div v-if="userReviews.length > 0" class="space-y-4">
						<div v-for="review in userReviews" :key="review.id" class="rounded-lg border p-4">
							<div class="mb-2 flex items-start justify-between">
								<div class="flex items-center space-x-2">
									<Rating :initial-value="review.rating" :allow-fraction="true" svg-class-name="inline-block" empty-class-name="fill-gray-50" :size="16" :readonly="true" />
									<span class="text-sm font-medium">{{ review.title }}</span>
								</div>
								<div class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</div>
							</div>
							<p class="mb-2 text-sm text-gray-700">{{ review.content }}</p>
							<p class="mb-2 text-sm text-gray-600">Sản phẩm: {{ getProductName(review.productId) }}</p>
							<div v-if="review.images && review.images.length > 0" class="mt-2 flex space-x-2">
								<img v-for="(img, idx) in review.images" :key="idx" :src="img" alt="Review image" class="h-16 w-16 rounded-md object-cover" />
							</div>
							<div v-if="review.reply" class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
								<div class="mb-1 flex items-center justify-between">
									<div class="flex items-center space-x-2">
										<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M18 13V6a2 2 0 00-2-2H8L4 6v7a2 2 0 002 2h10a2 2 0 002-2z" />
										</svg>
										<span class="text-sm font-semibold text-green-700">Phản hồi từ shop</span>
									</div>
									<span class="text-xs text-gray-500">{{ review.replyDate ? formatDate(review.replyDate) : "-" }}</span>
								</div>
								<p class="text-sm whitespace-pre-line text-gray-800">{{ review.reply }}</p>
							</div>
						</div>
					</div>
					<div v-else class="py-8 text-center text-gray-500">Bạn chưa có đánh giá nào.</div>

					<!-- Unreviewed Products -->
					<div v-if="unreviewedProducts.length > 0" class="mt-6">
						<h3 class="mb-4 text-lg font-semibold">Sản phẩm chưa đánh giá</h3>
						<div class="mb-3 p-2 bg-blue-100 rounded text-blue-800 text-xs">
							<strong>Lưu ý:</strong> Chỉ sản phẩm từ đơn hàng đã giao thành công mới được phép đánh giá
						</div>
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div v-for="product in unreviewedProducts" :key="product.id" class="rounded-lg border p-4">
								<div class="mb-2 flex items-center gap-2">
									<img :src="product.images?.[0] || '/placeholder.jpg'" :alt="product.name" class="h-12 w-12 rounded object-cover" />
									<div class="flex-1">
										<h4 class="text-sm font-medium">{{ product.name }}</h4>
										<p class="text-xs text-gray-500">{{ product.originalPrice }}$</p>
									</div>
								</div>
								<Button variant="outline" size="sm" class="w-full" @click="openReviewForm(product)">
									<Star class="size-4 mr-2" />
									Đánh giá ngay
								</Button>
							</div>
						</div>
					</div>

					<!-- Unreviewed Orders -->
					<div v-if="unreviewedOrders.length > 0" class="mt-8">
						<h3 class="mb-4 text-lg font-semibold">Đơn hàng có sản phẩm chưa đánh giá</h3>
						<div class="space-y-4">
							<div v-for="order in unreviewedOrders" :key="order.id" class="rounded-lg border p-4">
								<div class="mb-3 flex items-center justify-between text-sm text-gray-600">
									<div>Mã đơn: <span class="font-medium">{{ order.orderNumber }}</span></div>
									<div>Ngày: <span class="font-medium">{{ formatDate(order.createdAt) }}</span></div>
								</div>
								<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<div v-for="item in order.items" :key="item.productId" class="flex items-center gap-3 rounded border p-3">
										<img :src="item.productImage" :alt="item.productName" class="h-12 w-12 rounded object-cover" />
										<div class="flex-1">
											<div class="text-sm font-medium">{{ item.productName }}</div>
											<div class="text-xs text-gray-500">{{ item.productPrice }}đ</div>
										</div>
										<Button size="sm" @click="openReviewForm(item.product)">Đánh giá</Button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Debug Section (temporary) -->
				
				</CardContent>
			</Card>
		</div>

		<!-- Review Form Modal -->
		<div v-if="showReviewForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg" @click.stop>
				<h2 class="mb-4 text-lg font-semibold">Đánh giá sản phẩm: {{ selectedProduct?.name }}</h2>
				<div class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Đánh giá của bạn</label>
						<Rating v-model="newReview.rating" :editable="true" :initial-value="5" />
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Tiêu đề</label>
						<input v-model="newReview.title" type="text" placeholder="E.g. Sản phẩm rất tốt!" class="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Nội dung đánh giá</label>
						<textarea v-model="newReview.content" rows="4" placeholder="Chia sẻ trải nghiệm của bạn..." class="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Hình ảnh (tùy chọn)</label>
						<div class="text-xs text-gray-500 mb-2">Tối đa 5 ảnh, mỗi ảnh không quá 5MB</div>
						<input type="file" @change="handleImageUpload" multiple accept="image/*" class="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
						<div v-if="newReview.images.length > 0" class="mt-2 flex flex-wrap gap-2">
							<div v-for="(image, index) in newReview.images" :key="index" class="relative">
								<img :src="image" alt="Preview" class="h-16 w-16 rounded object-cover" />
								<button @click="removeImage(index)" type="button" class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600">×</button>
							</div>
						</div>
					</div>
					<div class="flex justify-end space-x-2">
						<Button variant="outline" @click="showReviewForm = false">Hủy</Button>
						<Button @click="submitReview">Gửi đánh giá</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>


