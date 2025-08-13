<template>
	<section class="mb-11">
		<!-- Tabs header -->
		<div class="border-b border-gray-200">
			<div class="flex space-x-8 overflow-x-auto">
				<button
					v-for="tab in ['Product Details', 'Rating & Reviews', 'FAQs']"
					:key="tab"
					class="border-b-2 py-4 text-sm font-medium whitespace-nowrap transition-colors"
					:class="{
						'border-black text-black': activeTab === tab,
						'border-transparent text-gray-500 hover:text-black': activeTab !== tab,
					}"
					@click="$emit('update:activeTab', tab)"
				>
					{{ tab }}
				</button>
			</div>
		</div>

			<!-- Tab Content -->
			<div class="mt-8">
				<!-- Rating & Reviews -->
				<div v-if="activeTab === 'Rating & Reviews'" class="space-y-6">
					<!-- Loading -->
					<!-- <div v-if="isCheckingReviewPermission" class="py-8 text-center text-gray-500">
						Checking review permissions...
					</div> -->

					<!-- Review Summary -->
					<div class="flex items-center space-x-4">
						<div class="text-center">
							<div class="text-3xl font-bold text-black">{{ averageRating.toFixed(1) }}</div>
							<div class="mt-1 flex justify-center">
								<StarRating :initialValue="averageRating" />
							</div>
							<div class="mt-1 text-sm text-gray-600">{{ reviewCount }} reviews</div>
						</div>
						<div class="flex-1 text-sm text-gray-600">
							Based on {{ reviewCount }} customer reviews
						</div>
					</div>

					<!-- Write Review Form -->
					<div v-if="canWriteReview" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 class="mb-3 text-lg font-semibold">Write a Review</h4>
						<!-- <div class="text-xs text-gray-500 mb-2">
							Debug: canReview={{ canReview }}, currentUser={{ currentUser ? 'logged in' : 'not logged in' }}
						</div> -->
						<div v-if="isCheckingReviewPermission" class="py-4 text-center text-gray-500">
							Checking review permissions...
						</div>
						<div v-else class="space-y-4">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Your Rating</label>
								<Rating v-model="newReview.rating" :editable="true" :initialValue="5" />
							</div>

							<div v-if="purchasedVariants.length > 0">
								<label class="mb-1 block text-sm font-medium text-gray-700">Select Variant</label>
								<select
									v-model="newReview.variantId"
									class="w-full rounded-lg border border-gray-300 text-sm focus:border-black focus:ring-black"
								>
									<option value="" disabled>Select a variant</option>
									<option
										v-for="variant in purchasedVariants"
										:key="variant.id"
										:value="variant.id"
									>
										{{ variant.name }}
									</option>
								</select>
							</div>
							<div v-else class="text-sm text-gray-600">
								No specific variants to select from this purchase.
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Title</label>
								<input
									v-model="newReview.title"
									type="text"
									placeholder="E.g. Great product!"
									class="w-full rounded border border-gray-300 text-sm p-2 focus:border-black focus:ring-black"
								/>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Your Review</label>
								<textarea
									v-model="newReview.content"
									rows="4"
									placeholder="Share your experience..."
									class="w-full rounded-lg border border-gray-300 text-sm focus:border-black focus:ring-black"
								></textarea>
							</div>

							<!-- Image Upload -->
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700">Upload Images (Optional)</label>
								<div class="text-xs text-gray-500 mb-2">
									Tối đa 5 ảnh, mỗi ảnh không quá 5MB
								</div>
								<div class="space-y-2">
									<input
										type="file"
										@change="handleImageUpload"
										multiple
										accept="image/*"
										class="w-full rounded border border-gray-300 text-sm p-2 focus:border-black focus:ring-black"
									/>
									<div v-if="newReview.images.length > 0" class="flex flex-wrap gap-2">
										<div
											v-for="(image, index) in newReview.images"
											:key="index"
											class="relative"
										>
											<img
												:src="image"
												alt="Preview"
												class="h-20 w-20 rounded object-cover"
											/>
											<button
												@click="removeImage(index)"
												type="button"
												class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
											>
												×
											</button>
										</div>
									</div>
									<div v-if="newReview.images.length > 0" class="text-xs text-gray-500">
										{{ newReview.images.length }}/5 ảnh đã chọn
									</div>
								</div>
							</div>

							<div class="flex justify-end">
								<button
									@click="submitReview"
									:disabled="isSubmittingReview"
									class="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
								>
									{{ isSubmittingReview ? "Submitting..." : "Submit Review" }}
								</button>
							</div>
						</div>
					</div>

					<div v-else-if="!currentUser" class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
						<p class="text-sm text-gray-600 mb-2">Please login to write a review.</p>
						<div class="text-xs text-gray-500 mb-2">
							Debug: currentUser={{ currentUser }}, canReview={{ canReview }}, purchasedVariants={{ purchasedVariants?.length || 0 }}
						</div>
						<a href="/login" class="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
							Login Now
						</a>
					</div>

					<div v-else-if="hasUserReviewed" class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
						<p class="text-sm text-gray-600 mb-2">You have already reviewed this product.</p>
						<div class="text-xs text-gray-500">
							Thank you for your review!
						</div>
					</div>

					<div v-else-if="isCheckingReviewPermission" class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
						<p class="text-sm text-gray-600">Checking review permissions...</p>
					</div>

					<div v-else class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
						<p class="text-sm text-gray-600">You must purchase this product to write a review.</p>
					</div>

					<!-- Reviews List -->
					<div v-if="reviews.length > 0" class="space-y-4">
						<div
							v-for="review in reviews"
							:key="review.id"
							class="rounded-lg border border-gray-200 p-4"
						>
							<div class="mb-2 flex items-start justify-between">
								<div class="flex items-center space-x-2">
									<StarRating :initialValue="review.rating" />
									<span class="text-sm font-medium">{{ review.title }}</span>
								</div>
								<div class="text-xs text-gray-500">{{ formatDate(review.createdAt) }}</div>
							</div>
							<p class="mb-2 text-sm text-gray-700">{{ review.content }}</p>
							<p v-if="review.variantName" class="mb-2 text-sm text-gray-600">
								Variant: {{ review.variantName }} ({{ review.color }}, {{ review.size }})
							</p>
							<div v-if="(review.images?.length ?? 0) > 0" class="mt-2 flex space-x-2">
								<img
									v-for="(img, idx) in review.images"
									:key="idx"
									:src="img"
									alt="Review image"
									class="h-20 w-20 rounded-md object-cover"
								/>
							</div>
							<div
								v-if="review.reply"
								class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3"
							>
								<div class="mb-1 flex items-center justify-between">
									<div class="flex items-center space-x-2">
										<!-- Icon phản hồi -->
										<svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M18 13V6a2 2 0 00-2-2H8L4 6v7a2 2 0 002 2h10a2 2 0 002-2z" />
										</svg>
										<span class="text-sm font-semibold text-green-700">Seller Reply</span>
									</div>
									<span class="text-xs text-gray-500">
										{{ review.replyDate ? new Date(review.replyDate).toLocaleDateString() : "-" }}
									</span>
								</div>
								<p class="text-sm whitespace-pre-line text-gray-800">
									{{ review.reply }}
								</p>
							</div>
						</div>
					</div>
					<div v-else class="py-8 text-center text-gray-500">
						No reviews yet. Be the first to review this product!
					</div>
					
				</div>
				<div v-if="activeTab === 'Product Details'" class="space-y-6">
					<h3 class="text-lg font-semibold text-black">Product specifications</h3>
					<div class="space-y-3">
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Brand</span>
							<span class="text-sm font-medium">{{ product.brand || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">SKU</span>
							<span class="text-sm font-medium">{{ product.sku || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Category</span>
							<span class="text-sm font-medium">{{ category?.name || "N/A" }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Weight</span>
							<span class="text-sm font-medium">{{
								product.weight ? `${product.weight}kg` : "N/A"
							}}</span>
						</div>
						<div
							v-if="product.dimensions"
							class="flex justify-between border-b border-gray-100 py-2"
						>
							<span class="text-sm text-gray-600">Dimensions</span>
							<span class="text-sm font-medium">
								{{ product.dimensions.length }}cm × {{ product.dimensions.width }}cm ×
								{{ product.dimensions.height }}cm
							</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Material composition</span>
							<span class="text-sm font-medium">100% Cotton</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Care instructions</span>
							<span class="text-sm font-medium">Machine wash cold</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Fit</span>
							<span class="text-sm font-medium">Regular fit</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Created</span>
							<span class="text-sm font-medium">{{ formatDate(product.createdAt) }}</span>
						</div>
						<div class="flex justify-between border-b border-gray-100 py-2">
							<span class="text-sm text-gray-600">Last Updated</span>
							<span class="text-sm font-medium">{{ formatDate(product.updatedAt) }}</span>
						</div>
					</div>
				</div>

			</div>
		</section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReviews } from "@/hook/use-reviews";
import type { Product, Review } from "@/types";
import type { Category } from "@/types/category";
import { AuthService } from "@/services/auth-service";
import { toast } from "vue-sonner";
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/ui/Rating.vue";
import Rating from "@/components/ui/Rating.vue";

// Props
const props = defineProps<{
	product: Product;
	category: Category | null;
	reviews: Review[];
	getAverageRating: number;
	getReviewCount: number;
	activeTab: string;
	isLoading: boolean;
}>();

defineEmits<{ (e: "update:activeTab", value: string): void }>();

const currentUser = ref<{ id: string; isAdmin: boolean } | null>(null);

onMounted(async () => {
	// Check if we have user data in localStorage or sessionStorage
	const token = localStorage.getItem("token") || sessionStorage.getItem("token");
	console.log("Token from localStorage:", localStorage.getItem("token"));
	console.log("Token from sessionStorage:", sessionStorage.getItem("token"));
	console.log("Final token:", token);
	
	// If no token, check if we have user data
	if (!token) {
		console.log("No token found in storage");
		
		// Check if we have user data in localStorage
		const userData = localStorage.getItem("auth");
		if (userData) {
			console.log("Found user data in localStorage:", userData);
			try {
				const authData = JSON.parse(userData);
				console.log("Parsed auth data:", authData);
				
				// Check if we have user and token in the auth data
				if (authData.user && authData.token) {
					console.log("Found user and token in auth data");
					
					// Set currentUser from stored user data
					currentUser.value = {
						id: authData.user.id.toString(),
						isAdmin: authData.user.role === "admin",
					};
					console.log("Set currentUser from stored data:", currentUser.value);
					
					// Also set the token for future use
					localStorage.setItem("token", authData.token);
					console.log("Set token from auth data:", authData.token);
					return;
				} else {
					console.log("No user or token found in auth data");
				}
			} catch (error) {
				console.error("Error parsing auth data:", error);
			}
		}
		
		currentUser.value = null;
		return;
	}

	try {
		console.log("Calling AuthService.getCurrentUser with token:", token);
		const user = await AuthService.getCurrentUser(token);
		console.log("Current user from AuthService:", user);
		
		if (user) {
			console.log("Setting currentUser with:", {
				id: user.id.toString(),
				isAdmin: user.role === "admin"
			});
			currentUser.value = {
				id: user.id.toString(),
				isAdmin: user.role === "admin",
			};
			console.log("currentUser.value after setting:", currentUser.value);
		} else {
			console.log("Failed to get current user from token");
			// Clear invalid token
			localStorage.removeItem("token");
			sessionStorage.removeItem("token");
			currentUser.value = null;
		}
	} catch (error) {
		console.error("Error getting current user:", error);
		// Clear invalid token
		localStorage.removeItem("token");
		sessionStorage.removeItem("token");
		currentUser.value = null;
	}
	
	// Log final state
	console.log("Final currentUser.value:", currentUser.value);
});

// Use reviews hook
const { 
  canReview, 
  purchasedVariants, 
  orderId,
  createReview, 
  isSubmittingReview,
  isCheckingReviewPermission 
} = useReviews(props.product.id.toString());

// Log review permissions for debugging
console.log("Review permissions debug:", {
  productId: props.product.id,
  canReview: canReview.value,
  purchasedVariants: purchasedVariants.value,
  orderId: orderId.value,
  isCheckingReviewPermission: isCheckingReviewPermission.value
});

// New review state
const newReview = ref<{
	rating: number;
	title: string;
	content: string;
	images: string[];
	variantId?: number;
}>({
	rating: 5, // Default to 5 stars
	title: "",
	content: "",
	images: [],
	variantId: undefined,
});

// Computed
const reviews = computed(() => props.reviews);
const averageRating = computed(() => props.getAverageRating);
const reviewCount = computed(() => props.getReviewCount);

// Check if user has already reviewed this product
const hasUserReviewed = computed(() => {
	if (!currentUser.value) return false;
	return reviews.value.some(review => review.userId === currentUser.value?.id);
});

// Check if user can write a new review
const canWriteReview = computed(() => {
	return canReview.value && currentUser.value && !hasUserReviewed.value;
});

// Submit review
const submitReview = async () => {
	if (!canReview.value) {
		toast.error("Bạn phải mua sản phẩm này để có thể đánh giá");
		return;
	}
	if (!newReview.value.rating) {
		toast.error("Vui lòng chọn số sao đánh giá");
		return;
	}
	if (!newReview.value.title) {
		toast.error("Vui lòng nhập tiêu đề");
		return;
	}
	if (!newReview.value.content) {
		toast.error("Vui lòng nhập nội dung đánh giá");
		return;
	}
	if (!currentUser.value) {
		toast.error("Bạn cần đăng nhập để đánh giá");
		return;
	}
	if (!orderId.value) {
		toast.error("Không tìm thấy thông tin đơn hàng");
		return;
	}
	// Validate variant selection only if there are variants available
	if (purchasedVariants.value.length > 0 && !newReview.value.variantId) {
		toast.error("Vui lòng chọn phân loại sản phẩm để đánh giá");
		return;
	}

	// Find the selected variant
	const selectedVariant = purchasedVariants.value.find((v) => v.id === newReview.value.variantId);

	const reviewData: Omit<Review, "id" | "createdAt"> = {
		productId: props.product.id.toString(),
		userId: currentUser.value.id.toString(),
		orderId: orderId.value,
		rating: newReview.value.rating,
		title: newReview.value.title,
		content: newReview.value.content,
		images: newReview.value.images,
		variantId: selectedVariant?.id || undefined,
		variantName: selectedVariant?.name || "",
		color: selectedVariant?.color || "",
		size: selectedVariant?.size || "",
		isVerified: true,
		isHelpful: 0,
	};

	try {
		await createReview(reviewData);
		toast.success("Đánh giá đã được gửi thành công!");
		// Reset form
		newReview.value = { 
			rating: 5, 
			title: "", 
			content: "", 
			images: [], 
			variantId: undefined 
		};
	} catch (error) {
		console.error("Error submitting review:", error);
		toast.error("Đã xảy ra lỗi khi gửi đánh giá");
	}
};

// Handle image upload
const handleImageUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		const files = Array.from(target.files);
		const maxImages = 5; // Giới hạn tối đa 5 ảnh
		
		if (newReview.value.images.length + files.length > maxImages) {
			toast.error(`Bạn chỉ có thể upload tối đa ${maxImages} ảnh`);
			return;
		}
		
		files.forEach(file => {
			if (file.type.startsWith('image/')) {
				// Kiểm tra kích thước file (giới hạn 5MB)
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
	// Reset input
	target.value = '';
};

// Remove image
const removeImage = (index: number) => {
	newReview.value.images.splice(index, 1);
};

// // Submit reply
// const submitReply = (reviewId: number) => {
//   if (!replyContent.value[reviewId]) return;
//   replyReview({ reviewId, reply: replyContent.value[reviewId] });
//   replyContent.value[reviewId] = "";
// };
</script>
