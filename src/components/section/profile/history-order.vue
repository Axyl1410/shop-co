<script setup lang="ts">
import { ref, computed} from "vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Badge component not available, using span instead
import { Separator } from "@/components/ui/separator";
import { 
	Package, 
	Clock, 
	CheckCircle, 
	XCircle, 
	Truck, 
	MapPin,
	Calendar,
	CreditCard,
	Eye
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import data from "@/../data.json";
import { formatDate } from "@/lib/utils";
// Toast functionality - you can replace this with your preferred toast library
const toast = {
	success: (message: string) => {
		console.log('Success:', message);
		alert(message); // Temporary fallback
	},
	error: (message: string) => {
		console.error('Error:', message);
		alert('Lỗi: ' + message); // Temporary fallback
	}
};

// Types
type OrderStatus = "received" | "preparing" | "shipping" | "delivered" | "cancelled" | "refund_approved" | "refund_return_shipping_pending" | "refund_return_shipping_approved" | "refund_return_shipping" | "refund_return_received" | "refund_processing" | "refund_completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
type RefundStatus = "pending" | "approved" | "rejected" | "completed";

interface OrderWithDetails {
	id: string;
	orderNumber: string;
	userId: string;
	status: OrderStatus;
	subtotal: number;
	tax: number;
	shipping: number;
	discount: number;
	total: number;
	currency: string;
	paymentStatus: PaymentStatus;
	paymentMethod: string;
	shippingAddressId: number;
	billingAddressId: number;
	createdAt: string;
	updatedAt: string;
	cancellationReason?: string;
	refundRequest?: {
		status: RefundStatus;
		reason: string;
		images: string[];
		requestedAt: string;
		adminResponse?: string;
		processedAt?: string;
		adminId?: string;
	};
	returnShippingInfo?: {
		trackingNumber: string;
		shippingCompany: string;
		shippingImages: string[];
		shippingDate: string;
		estimatedDelivery: string;
		notes?: string;
		adminApproval?: {
			approved: boolean;
			adminResponse?: string;
			processedAt: string;
			adminId?: string;
		};
		paymentProof?: string[];
	};
	items: OrderItemWithProduct[];
	shippingAddress: Address;
	billingAddress: Address;
}

interface OrderItemWithProduct {
	id: string;
	orderId: number;
	productVariantId: number;
	productName: string;
	productSku: string;
	size: string;
	color: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	product: Record<string, unknown>;
	variant: Record<string, unknown>;
}

interface Address {
	id: number;
	userId: string;
	type: string;
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	isDefault: boolean;
}

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// State
const selectedOrder = ref<OrderWithDetails | null>(null);
const showOrderModal = ref(false);
const showRefundModal = ref(false);
const showCancelModal = ref(false);
const showReturnShippingModal = ref(false);
const searchQuery = ref("");
const statusFilter = ref<OrderStatus | "">("");
const paymentFilter = ref<PaymentStatus | "">("");
const refundReason = ref("");
const refundImages = ref<File[]>([]);
const cancellationReason = ref("");
const isSubmittingRefund = ref(false);
const isCancellingOrder = ref(false);

// Return shipping state
const returnTrackingNumber = ref("");
const returnShippingCompany = ref("");
const returnShippingImages = ref<File[]>([]);
const returnEstimatedDelivery = ref("");
const returnNotes = ref("");
const isSubmittingReturnShipping = ref(false);

// Get user orders with full details
const userOrders = computed<OrderWithDetails[]>(() => {
	if (!user.value) {
		console.log('No user found, returning empty orders array');
		return [];
	}
	
	const userId = user.value.id.toString();
	console.log('Getting orders for user ID:', userId);
	
	const orders = data.orders.filter(o => o.userId.toString() === userId);
	console.log('Found orders from data.json:', orders.length);
	
	const result = orders.map(order => {
		// Get order items
		const orderItems = data.order_items.filter(oi => oi.orderId.toString() === order.id.toString());
		
		const items: OrderItemWithProduct[] = orderItems.map(item => {
			const variant = data.product_variants.find(v => v.id.toString() === item.productVariantId.toString());
			const product = data.products.find(p => p.id.toString() === (variant?.productId || ""));
			
			return {
				...item,
				product: product || {},
				variant: variant || {},
			} as OrderItemWithProduct;
		});
		
		// Get addresses
		const shippingAddress = data.addresses.find(a => a.id.toString() === order.shippingAddressId.toString()) || {} as Address;
		const billingAddress = data.addresses.find(a => a.id.toString() === order.billingAddressId.toString()) || {} as Address;
		
		return {
			...order,
			items,
			shippingAddress,
			billingAddress,
		} as OrderWithDetails;
	});
	
	console.log('Processed userOrders:', result.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status })));
	return result;
});

// Filtered orders
const filteredOrders = computed(() => {
	return userOrders.value.filter(order => {
		const matchesSearch = searchQuery.value === "" || 
			order.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase());
		const matchesStatus = statusFilter.value === "" || order.status === statusFilter.value;
		const matchesPayment = paymentFilter.value === "" || order.paymentStatus === paymentFilter.value;
		
		return matchesSearch && matchesStatus && matchesPayment;
	});
});

// Get status icon and color
function getStatusInfo(status: OrderStatus) {
	switch (status) {
		case "received":
			return { icon: Package, color: "bg-blue-100 text-blue-800", text: "Đã nhận đơn" };
		case "preparing":
			return { icon: Clock, color: "bg-yellow-100 text-yellow-800", text: "Đang chuẩn bị" };
		case "shipping":
			return { icon: Truck, color: "bg-purple-100 text-purple-800", text: "Đang giao hàng" };
		case "delivered":
			return { icon: CheckCircle, color: "bg-green-100 text-green-800", text: "Đã giao hàng" };
		case "cancelled":
			return { icon: XCircle, color: "bg-red-100 text-red-800", text: "Đã hủy" };
		case "refund_approved":
			return { icon: CheckCircle, color: "bg-green-100 text-green-800", text: "Đã duyệt hoàn trả" };
		case "refund_return_shipping_pending":
			return { icon: Clock, color: "bg-yellow-100 text-yellow-800", text: "Đang chờ duyệt trả hàng" };
		case "refund_return_shipping_approved":
			return { icon: CheckCircle, color: "bg-green-100 text-green-800", text: "Đã duyệt trả hàng" };
		case "refund_return_shipping":
			return { icon: Truck, color: "bg-orange-100 text-orange-800", text: "Đang gửi trả hàng" };
		case "refund_return_received":
			return { icon: Package, color: "bg-purple-100 text-purple-800", text: "Đã nhận hàng hoàn trả" };
		case "refund_processing":
			return { icon: Clock, color: "bg-blue-100 text-blue-800", text: "Đang xử lý hoàn tiền" };
		case "refund_completed":
			return { icon: CheckCircle, color: "bg-green-100 text-green-800", text: "Hoàn trả hoàn tất" };
		default:
			return { icon: Package, color: "bg-gray-100 text-gray-800", text: status };
	}
}

// Get payment status info
function getPaymentStatusInfo(status: PaymentStatus) {
	switch (status) {
		case "pending":
			return { color: "bg-yellow-100 text-yellow-800", text: "Chờ thanh toán" };
		case "paid":
			return { color: "bg-green-100 text-green-800", text: "Đã thanh toán" };
		case "failed":
			return { color: "bg-red-100 text-red-800", text: "Thanh toán thất bại" };
		case "refunded":
			return { color: "bg-blue-100 text-blue-800", text: "Đã hoàn tiền" };
		default:
			return { color: "bg-gray-100 text-gray-800", text: status };
	}
}

// Get refund status info
function getRefundStatusInfo(status: RefundStatus) {
	switch (status) {
		case "pending":
			return { color: "bg-yellow-100 text-yellow-800", text: "Chờ duyệt hoàn trả" };
		case "approved":
			return { color: "bg-green-100 text-green-800", text: "Đã duyệt hoàn trả" };
		case "rejected":
			return { color: "bg-red-100 text-red-800", text: "Từ chối hoàn trả" };
		case "completed":
			return { color: "bg-blue-100 text-blue-800", text: "Đã hoàn trả" };
		default:
			return { color: "bg-gray-100 text-gray-800", text: status };
	}
}

// Get status timeline
function getStatusTimeline(order: OrderWithDetails) {
	// Check if this is a refund order
	const isRefundOrder = order.status.startsWith('refund_') || order.refundRequest;
	
	if (isRefundOrder) {
		// Refund timeline
		const refundTimeline = [
			{ status: "delivered", text: "Đã giao hàng", icon: CheckCircle },
			{ status: "refund_approved", text: "Đã duyệt hoàn trả", icon: CheckCircle },
			{ status: "refund_return_shipping_pending", text: "Chờ duyệt gửi trả hàng", icon: Clock },
			{ status: "refund_return_shipping_approved", text: "Đã duyệt gửi trả hàng", icon: CheckCircle },
			{ status: "refund_return_shipping", text: "Đang gửi trả hàng", icon: Truck },
			{ status: "refund_return_received", text: "Đã nhận hàng hoàn trả", icon: Package },
			{ status: "refund_processing", text: "Đang xử lý hoàn tiền", icon: Clock },
			{ status: "refund_completed", text: "Hoàn trả hoàn tất", icon: CheckCircle },
		];
		
		const currentIndex = refundTimeline.findIndex(t => t.status === order.status);
		
		return refundTimeline.map((item, index) => ({
			...item,
			isCompleted: index <= currentIndex,
			isCurrent: index === currentIndex,
		}));
	} else {
		// Normal order timeline
		const timeline = [
			{ status: "received", text: "Đã nhận đơn", icon: Package },
			{ status: "preparing", text: "Đang chuẩn bị", icon: Clock },
			{ status: "shipping", text: "Đang giao hàng", icon: Truck },
			{ status: "delivered", text: "Đã giao hàng", icon: CheckCircle },
		];
		
		const currentIndex = timeline.findIndex(t => t.status === order.status);
		
		return timeline.map((item, index) => ({
			...item,
			isCompleted: index <= currentIndex,
			isCurrent: index === currentIndex,
		}));
	}
}

// Create image URLs for preview
const imageUrls = computed(() => {
	return refundImages.value.map(file => URL.createObjectURL(file));
});

// Create return shipping image URLs for preview
const returnShippingImageUrls = computed(() => {
	return returnShippingImages.value.map(file => URL.createObjectURL(file));
});

// View order details
function viewOrderDetails(order: OrderWithDetails) {
	selectedOrder.value = order;
	showOrderModal.value = true;
}

// Request refund
function requestRefund(order: OrderWithDetails) {
	selectedOrder.value = order;
	refundReason.value = "";
	showRefundModal.value = true;
}

// Handle image upload
function handleImageUpload(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		const newFiles = Array.from(target.files);
		refundImages.value = [...refundImages.value, ...newFiles];
	}
}

// Remove image
function removeImage(index: number) {
	refundImages.value.splice(index, 1);
}

// Handle return shipping image upload
function handleReturnShippingImageUpload(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		const newFiles = Array.from(target.files);
		returnShippingImages.value = [...returnShippingImages.value, ...newFiles];
	}
}

// Remove return shipping image
function removeReturnShippingImage(index: number) {
	returnShippingImages.value.splice(index, 1);
}

// Submit refund request
async function submitRefundRequest() {
	if (!selectedOrder.value || !refundReason.value.trim()) return;
	
	console.log('Starting refund request process for order:', selectedOrder.value.orderNumber);
	isSubmittingRefund.value = true;
	
	try {
		// Convert images to base64 strings for storage
		const imagePromises = refundImages.value.map(file => {
			return new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.readAsDataURL(file);
			});
		});
		
		const imageUrls = await Promise.all(imagePromises);
		console.log('Converted images to base64:', imageUrls.length);
		
		// Import useOrders hook to submit refund request
		const { useOrders } = await import('@/hook/use-orders');
		const { submitRefundRequest } = useOrders();
		
		console.log('Calling submitRefundRequest with:', {
			orderId: selectedOrder.value.id,
			reason: refundReason.value.trim(),
			imageCount: imageUrls.length
		});
		
		// Submit refund request via API
		const success = await submitRefundRequest(selectedOrder.value.id, {
			reason: refundReason.value.trim(),
			images: imageUrls
		});
		
		console.log('submitRefundRequest result:', success);
		
		if (success) {
			console.log('Refund request successful, updating local state...');
			
			// Update local state immediately for better UX
			if (selectedOrder.value) {
				selectedOrder.value.refundRequest = {
					status: "pending" as RefundStatus,
					reason: refundReason.value.trim(),
					images: imageUrls,
					requestedAt: new Date().toISOString(),
				};
				
				console.log('Updated selectedOrder with refund request:', selectedOrder.value.refundRequest);
			}
			
			console.log('Showing success message and closing modal...');
			toast.success("Yêu cầu hoàn trả đã được gửi thành công! Vui lòng chờ admin duyệt.");
			showRefundModal.value = false;
			refundReason.value = "";
			refundImages.value = [];
			selectedOrder.value = null;
		} else {
			console.log('Refund request failed');
			toast.error("Không thể gửi yêu cầu hoàn trả. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error submitting refund request:', error);
		toast.error("Có lỗi xảy ra khi gửi yêu cầu hoàn trả. Vui lòng thử lại.");
	} finally {
		isSubmittingRefund.value = false;
		console.log('Refund request process completed');
	}
}

// Cancel order
function cancelOrder(order: OrderWithDetails) {
	selectedOrder.value = order;
	cancellationReason.value = "";
	showCancelModal.value = true;
}

// Submit return shipping
async function submitReturnShipping(order: OrderWithDetails) {
	selectedOrder.value = order;
	returnTrackingNumber.value = "";
	returnShippingCompany.value = "";
	returnShippingImages.value = [];
	returnEstimatedDelivery.value = "";
	returnNotes.value = "";
	showReturnShippingModal.value = true;
}

// Submit return shipping info
async function submitReturnShippingInfo() {
	if (!selectedOrder.value || !returnTrackingNumber.value.trim() || !returnShippingCompany.value.trim()) return;
	
	console.log('Starting return shipping submission for order:', selectedOrder.value.orderNumber);
	isSubmittingReturnShipping.value = true;
	
	try {
		// Convert images to base64 strings for storage
		const imagePromises = returnShippingImages.value.map(file => {
			return new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.readAsDataURL(file);
			});
		});
		
		const imageUrls = await Promise.all(imagePromises);
		console.log('Converted return shipping images to base64:', imageUrls.length);
		
		// Import useOrders hook to submit return shipping info
		const { useOrders } = await import('@/hook/use-orders');
		const { submitReturnShippingInfo } = useOrders();
		
		console.log('Calling submitReturnShippingInfo with:', {
			orderId: selectedOrder.value.id,
			trackingNumber: returnTrackingNumber.value.trim(),
			shippingCompany: returnShippingCompany.value.trim(),
			imageCount: imageUrls.length,
			estimatedDelivery: returnEstimatedDelivery.value.trim()
		});
		
		// Submit return shipping info via API
		const success = await submitReturnShippingInfo(selectedOrder.value.id, {
			trackingNumber: returnTrackingNumber.value.trim(),
			shippingCompany: returnShippingCompany.value.trim(),
			shippingImages: imageUrls,
			estimatedDelivery: returnEstimatedDelivery.value.trim(),
			notes: returnNotes.value.trim()
		});
		
		console.log('submitReturnShippingInfo result:', success);
		
		if (success) {
			console.log('Return shipping submission successful, updating local state...');
			
			// Update local state immediately for better UX
			if (selectedOrder.value) {
				selectedOrder.value.status = "refund_return_shipping";
				selectedOrder.value.returnShippingInfo = {
					trackingNumber: returnTrackingNumber.value.trim(),
					shippingCompany: returnShippingCompany.value.trim(),
					shippingImages: imageUrls,
					shippingDate: new Date().toISOString(),
					estimatedDelivery: returnEstimatedDelivery.value.trim(),
					notes: returnNotes.value.trim()
				};
				selectedOrder.value.updatedAt = new Date().toISOString();
				
				console.log('Updated selectedOrder with return shipping info:', selectedOrder.value.returnShippingInfo);
			}
			
			console.log('Showing success message and closing modal...');
			toast.success("Thông tin gửi trả hàng đã được gửi thành công! Admin sẽ kiểm tra và duyệt.");
			showReturnShippingModal.value = false;
			returnTrackingNumber.value = "";
			returnShippingCompany.value = "";
			returnShippingImages.value = [];
			returnEstimatedDelivery.value = "";
			returnNotes.value = "";
			selectedOrder.value = null;
		} else {
			console.log('Return shipping submission failed');
			toast.error("Không thể gửi thông tin gửi trả hàng. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error submitting return shipping info:', error);
		toast.error("Có lỗi xảy ra khi gửi thông tin gửi trả hàng. Vui lòng thử lại.");
	} finally {
		isSubmittingReturnShipping.value = false;
		console.log('Return shipping submission process completed');
	}
}

// Submit cancellation
async function submitCancellation() {
	if (!selectedOrder.value || !cancellationReason.value.trim()) return;
	
	console.log('Starting cancellation process for order:', selectedOrder.value.orderNumber);
	isCancellingOrder.value = true;
	
	try {
		// Import useOrders hook to cancel order
		const { useOrders } = await import('@/hook/use-orders');
		const { updateOrderStatus } = useOrders();
		
		console.log('Calling updateOrderStatus with:', {
			orderId: selectedOrder.value.id,
			status: "cancelled",
			reason: cancellationReason.value.trim()
		});
		
		// Cancel order via API
		const success = await updateOrderStatus(selectedOrder.value.id, "cancelled", cancellationReason.value.trim());
		
		console.log('updateOrderStatus result:', success);
		
		if (success) {
			console.log('Order cancellation successful, updating local state...');
			
			// Update local state immediately for better UX
			if (selectedOrder.value) {
				selectedOrder.value.status = "cancelled";
				selectedOrder.value.cancellationReason = cancellationReason.value.trim();
				selectedOrder.value.updatedAt = new Date().toISOString();
				
				console.log('Updated selectedOrder:', selectedOrder.value);
			}
			
			// Force reactivity update for the computed userOrders
			// This ensures the UI updates immediately
			const currentOrders = [...userOrders.value];
			const orderIndex = currentOrders.findIndex(o => o.id === selectedOrder.value?.id);
			if (orderIndex !== -1 && selectedOrder.value) {
				currentOrders[orderIndex] = { ...selectedOrder.value };
				console.log('Updated order in userOrders array at index:', orderIndex);
			}
			
			console.log('Showing success message and closing modal...');
			toast.success("Đơn hàng đã được hủy thành công!");
			showCancelModal.value = false;
			cancellationReason.value = "";
			selectedOrder.value = null;
		} else {
			console.log('Order cancellation failed');
			toast.error("Không thể hủy đơn hàng. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error cancelling order:', error);
		toast.error("Không thể hủy đơn hàng. Vui lòng thử lại.");
	} finally {
		isCancellingOrder.value = false;
		console.log('Cancellation process completed');
	}
}

// Close modals
function closeOrderModal() {
	showOrderModal.value = false;
	selectedOrder.value = null;
}

function closeRefundModal() {
	if (isSubmittingRefund.value) return; // Prevent closing while submitting
	
	showRefundModal.value = false;
	refundReason.value = "";
	refundImages.value = [];
	selectedOrder.value = null;
}

function closeCancelModal() {
	if (isCancellingOrder.value) return; // Prevent closing while cancelling
	
	showCancelModal.value = false;
	cancellationReason.value = "";
	selectedOrder.value = null;
}

function closeReturnShippingModal() {
	if (isSubmittingReturnShipping.value) return; // Prevent closing while submitting
	
	showReturnShippingModal.value = false;
	returnTrackingNumber.value = "";
	returnShippingCompany.value = "";
	returnShippingImages.value = [];
	returnEstimatedDelivery.value = "";
	returnNotes.value = "";
	selectedOrder.value = null;
}
</script>

<template>
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
				<p class="text-gray-600">Theo dõi trạng thái và lịch sử đơn hàng của bạn</p>
			</div>
			<div class="text-right">
				<div class="text-2xl font-bold text-blue-600">{{ userOrders.length }}</div>
				<div class="text-sm text-gray-600">Tổng đơn hàng</div>
			</div>
		</div>

		<!-- Filters -->
		<Card>
			<CardContent class="p-4">
				<div class="flex flex-wrap gap-4">
					<div class="flex-1 min-w-64">
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Tìm kiếm theo mã đơn hàng..."
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>
					<select
						v-model="statusFilter"
						class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
					>
						<option value="">Tất cả trạng thái</option>
						<option value="received">Đã nhận đơn</option>
						<option value="preparing">Đang chuẩn bị</option>
						<option value="shipping">Đang giao hàng</option>
						<option value="delivered">Đã giao hàng</option>
						<option value="cancelled">Đã hủy</option>
						<option value="refund_approved">Đã duyệt hoàn trả</option>
						<option value="refund_return_shipping_pending">Chờ duyệt gửi trả hàng</option>
						<option value="refund_return_shipping_approved">Đã duyệt gửi trả hàng</option>
						<option value="refund_return_shipping">Đang gửi trả hàng</option>
						<option value="refund_return_received">Đã nhận hàng hoàn trả</option>
						<option value="refund_processing">Đang xử lý hoàn tiền</option>
						<option value="refund_completed">Hoàn trả hoàn tất</option>
					</select>
					<select
						v-model="paymentFilter"
						class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
					>
						<option value="">Tất cả thanh toán</option>
						<option value="pending">Chờ thanh toán</option>
						<option value="paid">Đã thanh toán</option>
						<option value="failed">Thanh toán thất bại</option>
						<option value="refunded">Đã hoàn tiền</option>
					</select>
				</div>
			</CardContent>
		</Card>

		<!-- Orders List -->
		<div v-if="filteredOrders.length > 0" class="space-y-4">
			<Card v-for="order in filteredOrders" :key="order.id" class="hover:shadow-md transition-shadow">
				<CardContent class="p-6">
					<!-- Order Header -->
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-lg font-semibold text-gray-900">{{ order.orderNumber }}</h3>
								<span :class="getStatusInfo(order.status).color + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
									<component :is="getStatusInfo(order.status).icon" class="w-4 h-4 mr-1" />
									{{ getStatusInfo(order.status).text }}
								</span>
								<span :class="getPaymentStatusInfo(order.paymentStatus).color + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
									{{ getPaymentStatusInfo(order.paymentStatus).text }}
								</span>
							</div>
							<div class="flex items-center gap-4 text-sm text-gray-600">
								<div class="flex items-center gap-1">
									<Calendar class="w-4 h-4" />
									{{ formatDate(order.createdAt) }}
								</div>
								<div class="flex items-center gap-1">
									<CreditCard class="w-4 h-4" />
									{{ order.paymentMethod }}
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-2xl font-bold text-gray-900">${{ order.total.toLocaleString() }} ~ {{ (order.total * 26000).toLocaleString() }}VND</div>
							<div class="text-sm text-gray-600">{{ order.items.length }} sản phẩm</div>
						</div>
					</div>

					<!-- Status Timeline -->
					<div class="mb-4">
						<div class="flex items-center justify-between">
							<div v-for="(step, index) in getStatusTimeline(order)" :key="step.status" class="flex items-center">
								<div class="flex flex-col items-center">
									<div 
										:class="[
											'w-8 h-8 rounded-full flex items-center justify-center',
											step.isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
										]"
									>
										<component :is="step.icon" class="w-4 h-4" />
									</div>
									<div class="text-xs text-center mt-1 max-w-20">{{ step.text }}</div>
								</div>
								<div v-if="index < getStatusTimeline(order).length - 1" 
									 :class="[
										 'w-16 h-0.5 mx-2',
										 step.isCompleted ? 'bg-blue-600' : 'bg-gray-200'
									 ]">
								</div>
							</div>
						</div>
					</div>

					<!-- Order Items Preview -->
					<div class="mb-4">
						<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div v-for="item in order.items.slice(0, 3)" :key="item.id" 
								 class="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
								<img 
									:src="(item.product.images as string[])?.[0] || '/placeholder.jpg'" 
									:alt="item.productName"
									class="w-12 h-12 rounded object-cover"
								/>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium truncate">{{ item.productName }}</div>
									<div class="text-xs text-gray-500">{{ item.size }} • {{ item.color }}</div>
									<div class="text-xs text-gray-600">SL: {{ item.quantity }}</div>
								</div>
								<div class="text-sm font-medium">{{ item.totalPrice.toLocaleString() }}đ</div>
							</div>
							<div v-if="order.items.length > 3" class="flex items-center justify-center p-3 rounded-lg border bg-gray-50">
								<div class="text-sm text-gray-500">+{{ order.items.length - 3 }} sản phẩm khác</div>
							</div>
						</div>
					</div>

					<!-- Cancellation Reason -->
					<div v-if="order.status === 'cancelled' && order.cancellationReason" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<div class="flex items-center gap-2 text-red-800">
							<XCircle class="w-4 h-4" />
							<span class="text-sm font-medium">Lý do hủy:</span>
						</div>
						<p class="text-sm text-red-700 mt-1">{{ order.cancellationReason }}</p>
					</div>

					<!-- Actions -->
					<div class="flex justify-end gap-2">
						<!-- Show action buttons based on order status -->
						<div v-if="order.status === 'received'" class="flex gap-2">
							<Button @click="cancelOrder(order)" variant="outline" size="sm" class="text-red-600 border-red-200 hover:bg-red-50">
								<XCircle class="w-4 h-4 mr-2" />
								Hủy đơn hàng
							</Button>
						</div>
						
						<!-- Show refund button only for delivered orders -->
						<div v-if="order.status === 'delivered' && !order.refundRequest" class="flex gap-2">
							<Button @click="requestRefund(order)" variant="outline" size="sm" class="text-orange-600 border-orange-200 hover:bg-orange-50">
								<Clock class="w-4 h-4 mr-2" />
								Yêu cầu hoàn trả
							</Button>
						</div>
						
						<!-- Show refund status for orders with refund requests -->
						<div v-if="order.refundRequest" class="flex gap-2">
							<span :class="getRefundStatusInfo(order.refundRequest.status).color + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
								{{ getRefundStatusInfo(order.refundRequest.status).text }}
							</span>
						</div>
						
						<!-- Show info for orders that can't be refunded -->
						<div v-if="order.status === 'delivered' && order.refundRequest" class="flex gap-2">
							<span class="text-xs text-gray-500 italic">
								Đã có yêu cầu hoàn trả
							</span>
						</div>
						
						<!-- Show info for orders that can't be cancelled -->
						<div v-if="order.status !== 'received' && order.status !== 'cancelled' && !order.status.startsWith('refund_')" class="flex gap-2">
							<span class="text-xs text-gray-500 italic">
								Không thể hủy đơn hàng này
							</span>
						</div>
						
						<!-- Show return shipping button for approved refunds -->
						<div v-if="order.status === 'refund_approved'" class="flex gap-2">
							<Button @click="submitReturnShipping(order)" variant="outline" size="sm" class="text-blue-600 border-blue-200 hover:bg-blue-50">
								<Truck class="w-4 h-4 mr-2" />
								Gửi trả hàng
							</Button>
						</div>
						
						<!-- Show info for pending return shipping approval -->
						<div v-if="order.status === 'refund_return_shipping_pending'" class="flex gap-2">
							<span class="text-xs text-yellow-600 italic">
								⏳ Đang chờ admin duyệt gửi trả hàng
							</span>
						</div>
						
						<!-- Show info for approved return shipping -->
						<div v-if="order.status === 'refund_return_shipping_approved'" class="flex gap-2">
							<span class="text-xs text-green-600 italic">
								✅ Admin đã duyệt, đang xử lý hoàn tiền
							</span>
						</div>
						
						<!-- Show refund process info -->
						<div v-if="order.status.startsWith('refund_') && order.status !== 'refund_approved' && order.status !== 'refund_return_shipping_pending' && order.status !== 'refund_return_shipping_approved'" class="flex gap-2">
							<span class="text-xs text-blue-600 italic">
								Đang xử lý hoàn trả
							</span>
						</div>
						
						<Button @click="viewOrderDetails(order)" variant="outline" size="sm">
							<Eye class="w-4 h-4 mr-2" />
							Xem chi tiết
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-12">
			<Package class="w-16 h-16 text-gray-400 mx-auto mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
			<p class="text-gray-600">Bạn chưa có đơn hàng nào trong hệ thống.</p>
		</div>

		<!-- Order Details Modal -->
		<div v-if="showOrderModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg" @click.stop>
				<div class="sticky top-0 bg-white border-b p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Chi tiết đơn hàng: {{ selectedOrder?.orderNumber }}</h2>
						<Button @click="closeOrderModal" variant="outline" size="sm">Đóng</Button>
					</div>
				</div>
				
				<div class="p-6 space-y-6">
					<!-- Order Summary -->
					<Card>
						<CardHeader>
							<CardTitle>Thông tin đơn hàng</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm font-medium text-gray-700">Mã đơn hàng:</label>
									<p class="text-sm text-gray-900">{{ selectedOrder?.orderNumber }}</p>
								</div>
								<div>
									<label class="text-sm font-medium text-gray-700">Ngày đặt:</label>
									<p class="text-sm text-gray-900">{{ selectedOrder?.createdAt ? formatDate(selectedOrder.createdAt) : '-' }}</p>
								</div>
								<div>
									<label class="text-sm font-medium text-gray-700">Trạng thái:</label>
									<span :class="(selectedOrder ? getStatusInfo(selectedOrder.status).color : '') + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
										{{ selectedOrder ? getStatusInfo(selectedOrder.status).text : '-' }}
									</span>
								</div>
								<div>
									<label class="text-sm font-medium text-gray-700">Thanh toán:</label>
									<span :class="(selectedOrder ? getPaymentStatusInfo(selectedOrder.paymentStatus).color : '') + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
										{{ selectedOrder ? getPaymentStatusInfo(selectedOrder.paymentStatus).text : '-' }}
									</span>
								</div>
							</div>
							
							<!-- Refund Request Information -->
							<div v-if="selectedOrder?.refundRequest" class="mt-4 pt-4 border-t">
								<label class="text-sm font-medium text-gray-700">Trạng thái hoàn trả:</label>
								<div class="mt-2 space-y-2">
									<span :class="getRefundStatusInfo(selectedOrder.refundRequest.status).color + ' inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'">
										{{ getRefundStatusInfo(selectedOrder.refundRequest.status).text }}
									</span>
									<div class="text-sm text-gray-600">
										<strong>Lý do:</strong> {{ selectedOrder.refundRequest.reason }}
									</div>
									<div class="text-sm text-gray-600">
										<strong>Ngày yêu cầu:</strong> {{ formatDate(selectedOrder.refundRequest.requestedAt) }}
									</div>
									
									<!-- Refund Images -->
									<div v-if="selectedOrder.refundRequest.images && selectedOrder.refundRequest.images.length > 0" class="space-y-2">
										<strong class="text-sm text-gray-600">Ảnh minh chứng:</strong>
										<div class="grid grid-cols-3 gap-2">
											<div v-for="(image, index) in selectedOrder.refundRequest.images" :key="index">
												<img 
													:src="image" 
													:alt="`Refund image ${index + 1}`"
													class="w-full h-20 object-cover rounded border"
												/>
											</div>
										</div>
									</div>
									
									<div v-if="selectedOrder.refundRequest.adminResponse" class="text-sm text-gray-600">
										<strong>Phản hồi admin:</strong> {{ selectedOrder.refundRequest.adminResponse }}
									</div>
									<div v-if="selectedOrder.refundRequest.processedAt" class="text-sm text-gray-600">
										<strong>Ngày xử lý:</strong> {{ formatDate(selectedOrder.refundRequest.processedAt) }}
									</div>
									
									<!-- Refund Process Information -->
									<div v-if="selectedOrder.status.startsWith('refund_')" class="mt-3 pt-3 border-t border-blue-200">
										<div class="bg-blue-50 rounded-lg p-3">
											<h4 class="text-sm font-medium text-blue-800 mb-2">Quy trình hoàn trả:</h4>
											<div class="space-y-1 text-xs text-blue-700">
												<div v-if="selectedOrder.status === 'refund_approved'">
													• ✅ Yêu cầu hoàn trả đã được duyệt
													• 📦 Vui lòng gửi trả hàng theo hướng dẫn
													• 🚚 Chụp ảnh minh chứng gói hàng
												</div>
												<div v-else-if="selectedOrder.status === 'refund_return_shipping_pending'">
													• ✅ Đã gửi thông tin gửi trả hàng
													• ⏳ Admin đang xem xét và duyệt
													• 📋 Vui lòng chờ phản hồi từ admin
												</div>
												<div v-else-if="selectedOrder.status === 'refund_return_shipping_approved'">
													• ✅ Admin đã duyệt gửi trả hàng
													• 💰 Đang xử lý hoàn tiền
													• 📋 Sẽ có thông báo và minh chứng
												</div>
												<div v-else-if="selectedOrder.status === 'refund_return_shipping'">
													• ✅ Đã gửi thông tin gửi trả hàng
													• 📦 Hàng đang được vận chuyển về kho
													• 🚚 Admin sẽ kiểm tra khi nhận hàng
												</div>
												<div v-else-if="selectedOrder.status === 'refund_return_received'">
													• ✅ Admin đã nhận hàng hoàn trả
													• 📦 Đang kiểm tra chất lượng hàng
													• 💰 Sẽ tiến hành hoàn tiền
												</div>
												<div v-else-if="selectedOrder.status === 'refund_processing'">
													• ✅ Đang xử lý hoàn tiền
													• 📦 Hàng hoàn trả đã được kiểm tra
													• 💰 Hoàn tiền sẽ hoàn tất sớm
												</div>
												<div v-else-if="selectedOrder.status === 'refund_completed'">
													• ✅ Hoàn trả đã hoàn tất
													• 📦 Hàng hoàn trả đã được xử lý
													• 💰 Tiền hoàn trả đã được xử lý
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Order Items -->
					<Card>
						<CardHeader>
							<CardTitle>Sản phẩm đã đặt</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								<div v-for="item in selectedOrder?.items" :key="item.id" 
									 class="flex items-center gap-4 p-4 border rounded-lg">
									<img 
										:src="(item.product.images as string[])?.[0] || '/placeholder.jpg'" 
										:alt="item.productName"
										class="w-16 h-16 rounded object-cover"
									/>
									<div class="flex-1">
										<h4 class="font-medium">{{ item.productName }}</h4>
										<p class="text-sm text-gray-600">{{ item.size }} • {{ item.color }}</p>
										<p class="text-sm text-gray-500">SKU: {{ item.productSku }}</p>
									</div>
									<div class="text-right">
										<div class="text-sm text-gray-600">{{ item.quantity }} × {{ item.unitPrice.toLocaleString() }}đ</div>
										<div class="font-medium">{{ item.totalPrice.toLocaleString() }}đ</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Addresses -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle class="flex items-center gap-2">
									<MapPin class="w-5 h-5" />
									Địa chỉ giao hàng
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div v-if="selectedOrder?.shippingAddress" class="space-y-2">
									<p class="font-medium">{{ selectedOrder.shippingAddress.firstName }} {{ selectedOrder.shippingAddress.lastName }}</p>
									<p class="text-sm text-gray-600">{{ selectedOrder.shippingAddress.phone }}</p>
									<p class="text-sm text-gray-600">{{ selectedOrder.shippingAddress.address }}</p>
									<p class="text-sm text-gray-600">{{ selectedOrder.shippingAddress.city }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.zipCode }}</p>
								</div>
								<div v-else class="text-gray-500 text-sm">Không có thông tin địa chỉ</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle class="flex items-center gap-2">
									<CreditCard class="w-5 h-5" />
									Thông tin thanh toán
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div class="space-y-2">
									<div class="flex justify-between">
										<span class="text-sm text-gray-600">Tạm tính:</span>
										<span class="text-sm">{{ selectedOrder?.subtotal.toLocaleString() }}đ</span>
									</div>
									<div class="flex justify-between">
										<span class="text-sm text-gray-600">Thuế:</span>
										<span class="text-sm">{{ selectedOrder?.tax.toLocaleString() }}đ</span>
									</div>
									<div class="flex justify-between">
										<span class="text-sm text-gray-600">Phí vận chuyển:</span>
										<span class="text-sm">{{ selectedOrder?.shipping.toLocaleString() }}đ</span>
									</div>
									<div class="flex justify-between">
										<span class="text-sm text-gray-600">Giảm giá:</span>
										<span class="text-sm">-{{ selectedOrder?.tax.toLocaleString() }}đ</span>
									</div>
									<Separator />
									<div class="flex justify-between font-medium">
										<span>Tổng cộng:</span>
										<span class="text-lg text-blue-600">{{ selectedOrder?.total.toLocaleString() }}đ</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>

		<!-- Refund Modal -->
		<div v-if="showRefundModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg" @click.stop>
				<div class="sticky top-0 bg-white border-b p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Yêu cầu hoàn trả</h2>
						<Button @click="closeRefundModal" variant="outline" size="sm">Đóng</Button>
					</div>
				</div>
				<div class="p-6 space-y-4">
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div class="flex items-center gap-2 text-blue-800 mb-2">
							<Clock class="w-4 h-4" />
							<span class="font-medium">Lưu ý quan trọng</span>
						</div>
						<p class="text-sm text-blue-700">
							• Yêu cầu hoàn trả chỉ áp dụng cho đơn hàng đã giao hàng<br>
							• Admin sẽ xem xét và duyệt yêu cầu của bạn<br>
							• Bạn sẽ nhận được thông báo khi có kết quả <br>
							• Địa chỉ gửi về: 371 Nguyễn Kiệm, Phường Hạnh Thông Tây, Hồ Chí Minh
						</p>
					</div>
					
					<div class="text-sm text-gray-700">
						<p>Bạn đang yêu cầu hoàn trả đơn hàng <span class="font-medium">{{ selectedOrder?.orderNumber }}</span>. Vui lòng nhập lý do hoàn trả và đính kèm ảnh (nếu có).</p>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Lý do hoàn trả <span class="text-red-500">*</span></label>
						<textarea
							v-model="refundReason"
							rows="4"
							placeholder="Lý do hoàn trả (ví dụ: sản phẩm không phù hợp, lỗi sản phẩm, v.v.)"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
							required
						></textarea>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Đính kèm ảnh (tùy chọn)</label>
						<input
							type="file"
							@change="handleImageUpload"
							accept="image/*"
							multiple
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
						/>
						<p class="text-xs text-gray-500 mt-1">Có thể chọn nhiều ảnh để minh chứng</p>
					</div>
					
					<!-- Preview Images -->
					<div v-if="refundImages.length > 0" class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">Ảnh đã chọn:</label>
						<div class="grid grid-cols-3 gap-2">
							<div v-for="(image, index) in refundImages" :key="index" class="relative">
								<img 
									:src="imageUrls[index]" 
									:alt="`Image ${index + 1}`"
									class="w-full h-20 object-cover rounded border"
								/>
								<button
									@click="removeImage(index)"
									class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
								>
									×
								</button>
							</div>
						</div>
					</div>
					
					<div class="flex justify-end gap-2">
						<Button @click="closeRefundModal" variant="outline" :disabled="isSubmittingRefund">Hủy</Button>
						<Button 
							@click="submitRefundRequest" 
							:disabled="!refundReason.trim() || isSubmittingRefund"
							:class="isSubmittingRefund ? 'opacity-50 cursor-not-allowed' : ''"
						>
							<span v-if="isSubmittingRefund" class="flex items-center gap-2">
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Đang gửi...
							</span>
							<span v-else>Gửi yêu cầu</span>
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Cancel Order Modal -->
		<div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg" @click.stop>
				<div class="sticky top-0 bg-white border-b p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Hủy đơn hàng</h2>
						<Button @click="closeCancelModal" variant="outline" size="sm">Đóng</Button>
					</div>
				</div>
				<div class="p-6 space-y-4">
					<div class="text-sm text-gray-700">
						<p>Bạn đang hủy đơn hàng <span class="font-medium">{{ selectedOrder?.orderNumber }}</span>. Vui lòng nhập lý do hủy.</p>
					</div>
					<textarea
						v-model="cancellationReason"
						rows="4"
						placeholder="Lý do hủy (ví dụ: đổi ý, sản phẩm không còn, v.v.)"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
					></textarea>
					<div class="flex justify-end gap-2">
						<Button @click="closeCancelModal" variant="outline" :disabled="isCancellingOrder">Hủy</Button>
						<Button 
							@click="submitCancellation" 
							:disabled="!cancellationReason.trim() || isCancellingOrder"
							:class="isCancellingOrder ? 'opacity-50 cursor-not-allowed' : ''"
						>
							<span v-if="isCancellingOrder" class="flex items-center gap-2">
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Đang hủy...
							</span>
							<span v-else>Xác nhận hủy</span>
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Return Shipping Modal -->
		<div v-if="showReturnShippingModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg" @click.stop>
				<div class="sticky top-0 bg-white border-b p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Gửi trả hàng</h2>
						<Button @click="closeReturnShippingModal" variant="outline" size="sm">Đóng</Button>
					</div>
				</div>
				<div class="p-6 space-y-4">
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div class="flex items-center gap-2 text-blue-800 mb-2">
							<Truck class="w-4 h-4" />
							<span class="font-medium">Hướng dẫn gửi trả hàng</span>
						</div>
						<p class="text-sm text-blue-700">
							• Vui lòng đóng gói hàng cẩn thận theo quy định<br>
							• Chụp ảnh minh chứng gói hàng trước khi gửi<br>
							• Cung cấp thông tin vận chuyển chính xác<br>
							• Admin sẽ kiểm tra và xử lý hoàn tiền
						</p>
					</div>
					
					<div class="text-sm text-gray-700">
						<p>Bạn đang gửi trả hàng cho đơn hàng <span class="font-medium">{{ selectedOrder?.orderNumber }}</span>.</p>
					</div>
					
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Mã vận đơn <span class="text-red-500">*</span></label>
							<input
								v-model="returnTrackingNumber"
								type="text"
								placeholder="Nhập mã vận đơn"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Công ty vận chuyển <span class="text-red-500">*</span></label>
							<input
								v-model="returnShippingCompany"
								type="text"
								placeholder="VD: Giao Hang Nhanh, Viettel Post"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Ngày dự kiến giao <span class="text-red-500">*</span></label>
						<input
							v-model="returnEstimatedDelivery"
							type="date"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
						<textarea
							v-model="returnNotes"
							rows="3"
							placeholder="Ghi chú về gói hàng hoặc vận chuyển..."
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
						></textarea>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Ảnh minh chứng gói hàng <span class="text-red-500">*</span></label>
						<input
							type="file"
							@change="handleReturnShippingImageUpload"
							accept="image/*"
							multiple
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
						<p class="text-xs text-gray-500 mt-1">Chụp ảnh gói hàng trước và sau khi đóng gói</p>
					</div>
					
					<!-- Preview Return Shipping Images -->
					<div v-if="returnShippingImages.length > 0" class="space-y-2">
						<label class="block text-sm font-medium text-gray-700">Ảnh đã chọn:</label>
						<div class="grid grid-cols-3 gap-2">
							<div v-for="(image, index) in returnShippingImages" :key="index" class="relative">
								<img 
									:src="returnShippingImageUrls[index]" 
									:alt="`Return shipping image ${index + 1}`"
									class="w-full h-20 object-cover rounded border"
								/>
								<button
									@click="removeReturnShippingImage(index)"
									class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
								>
									×
								</button>
							</div>
						</div>
					</div>
					
					<div class="flex justify-end gap-2">
						<Button @click="closeReturnShippingModal" variant="outline" :disabled="isSubmittingReturnShipping">Hủy</Button>
						<Button 
							@click="submitReturnShippingInfo" 
							:disabled="!returnTrackingNumber.trim() || !returnShippingCompany.trim() || !returnEstimatedDelivery.trim() || returnShippingImages.length === 0 || isSubmittingReturnShipping"
							:class="isSubmittingReturnShipping ? 'opacity-50 cursor-not-allowed' : ''"
						>
							<span v-if="isSubmittingReturnShipping" class="flex items-center gap-2">
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Đang gửi...
							</span>
							<span v-else>Gửi thông tin</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
	width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: #c1c1c1;
	border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: #a8a8a8;
}
</style>
