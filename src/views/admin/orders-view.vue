<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useOrders, type OrderStatus, type PaymentStatus, type OrderWithDetails } from "@/hook/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
	Search, 
	Eye, 
	Edit, 
	
	Package,
	Clock
} from "lucide-vue-next";
import data from "@/../data.json";
import { formatDate } from "@/lib/utils";
// import TestRefund from "@/components/test-refund.vue";

const {
	selectedOrder,
	showOrderModal,
	showStatusModal,
	getOrderWithDetails,
	updateOrderStatus,
	processRefundRequest,
	orders,
	exportUpdatedData,
	totalOrders,
	expectedRevenue,
	actualRevenue,
	ordersByStatus,
	filteredOrders,
	searchQuery,
	statusFilter,
	paymentFilter,
} = useOrders();

// Status options
const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
	{ value: "received", label: "Đã nhận đơn", color: "bg-blue-100 text-blue-800" },
	{ value: "preparing", label: "Đang chuẩn bị hàng", color: "bg-yellow-100 text-yellow-800" },
	{ value: "shipping", label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
	{ value: "delivered", label: "Đã giao hàng", color: "bg-green-100 text-green-800" },
	{ value: "cancelled", label: "Hủy hàng", color: "bg-red-100 text-red-800" },
	{ value: "refund_approved", label: "Đã duyệt hoàn trả", color: "bg-green-100 text-green-800" },
	{ value: "refund_return_shipping_pending", label: "Chờ duyệt gửi trả hàng", color: "bg-orange-100 text-orange-800" },
	{ value: "refund_return_shipping_approved", label: "Đã duyệt gửi trả hàng", color: "bg-blue-100 text-blue-800" },
	{ value: "refund_return_shipping", label: "Đang gửi trả hàng", color: "bg-orange-100 text-orange-800" },
	{ value: "refund_return_received", label: "Đã nhận hàng hoàn trả", color: "bg-purple-100 text-purple-800" },
	{ value: "refund_processing", label: "Đang xử lý hoàn tiền", color: "bg-blue-100 text-blue-800" },
	{ value: "refund_completed", label: "Hoàn trả hoàn tất", color: "bg-green-100 text-green-800" },
];

// Payment status options
const paymentStatusOptions: { value: PaymentStatus; label: string; color: string }[] = [
	{ value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
	{ value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
	{ value: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
	{ value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-800" },
];

// Local state
const selectedStatus = ref<OrderStatus>("received");
const orderToUpdate = ref<string>("");
const cancellationReason = ref("");
const showCancellationReason = ref(false);
const showRefundModal = ref(false);
const selectedRefundOrder = ref<string>("");
const refundAction = ref<"approve" | "reject">("approve");
const adminResponse = ref("");

// Return shipping approval state
const showReturnShippingApprovalModal = ref(false);
const selectedReturnShippingOrder = ref<string>("");
const returnShippingAdminResponse = ref("");
const returnShippingPaymentProof = ref<File[]>([]);
const isApprovingReturnShipping = ref(false);

// Payment status update state
const showPaymentStatusModal = ref(false);
const selectedPaymentOrder = ref<string>("");
const selectedPaymentStatus = ref<PaymentStatus>("pending");

// Get user info
const getUserInfo = (userId: string) => {
	const user = data.users.find(u => u.id.toString() === userId);
	return user ? { name: `${user.firstName} ${user.lastName}`.trim() || user.username, email: user.email } : { name: "Unknown", email: "N/A" };
};

// Get address info
const getAddressInfo = (addressId: number) => {
	const address = data.addresses.find(a => a.id.toString() === addressId.toString());
	return address ? {
		fullName: address.fullName,
		phone: address.phone,
		address: address.address,
		city: address.city,
		state: address.state,
		zipCode: address.zipCode,
		country: address.country
	} : { fullName: "N/A", phone: "N/A", address: "N/A", city: "N/A", state: "N/A", zipCode: "N/A", country: "N/A" };
};

// Get payment method display name
const getPaymentMethodName = (method: string) => {
	const methodNames: Record<string, string> = {
		credit_card: "Credit Card",
		debit_card: "Debit Card",
		paypal: "PayPal",
		bank_transfer: "Bank Transfer",
		cash: "Cash on Delivery"
	};
	return methodNames[method] || method;
};

// View order details
const viewOrder = (orderId: string) => {
	const orderDetails = getOrderWithDetails(orderId);
	if (orderDetails) {
		selectedOrder.value = orderDetails;
		showOrderModal.value = true;
	}
};

// Open status update modal
const openStatusModal = (orderId: string, currentStatus: OrderStatus) => {
	orderToUpdate.value = orderId;
	selectedStatus.value = currentStatus;
	cancellationReason.value = "";
	showCancellationReason.value = false;
	showStatusModal.value = true;
};

// Update order status
const handleStatusUpdate = async () => {
	if (orderToUpdate.value) {
		// Check if cancellation reason is required
		if (selectedStatus.value === "cancelled" && !cancellationReason.value.trim()) {
			alert("Vui lòng nhập lý do hủy hàng");
			return;
		}
		
		await updateOrderStatus(orderToUpdate.value, selectedStatus.value, cancellationReason.value);
		orderToUpdate.value = "";
		cancellationReason.value = "";
		showCancellationReason.value = false;
	}
};

// Watch for status changes to show/hide cancellation reason
const handleStatusChange = () => {
	showCancellationReason.value = selectedStatus.value === "cancelled";
	if (selectedStatus.value !== "cancelled") {
		cancellationReason.value = "";
	}
};

// Open refund modal
const openRefundModal = (orderId: string) => {
	selectedRefundOrder.value = orderId;
	refundAction.value = "approve";
	adminResponse.value = "";
	showRefundModal.value = true;
};

// Handle refund action
const handleRefundAction = async () => {
	if (!selectedRefundOrder.value || !adminResponse.value.trim()) return;
	
	try {
		// Call API to process refund request
		const success = await processRefundRequest(
			selectedRefundOrder.value, 
			refundAction.value, 
			adminResponse.value
		);
		
		if (success) {
			// Close modal on success
			showRefundModal.value = false;
			selectedRefundOrder.value = "";
			adminResponse.value = "";
		}
	} catch (error) {
		console.error('Error processing refund:', error);
		alert('Có lỗi xảy ra khi xử lý yêu cầu hoàn trả. Vui lòng thử lại.');
	}
};

// Add new functions for refund process management
const confirmReturnShipmentReceived = async (order: OrderWithDetails) => {
	try {
		const { useOrders } = await import('@/hook/use-orders');
		const { confirmReturnShipmentReceived } = useOrders();
		const success = await confirmReturnShipmentReceived(order.id);
		if (success) {
			// Update local state
			const orderIndex = orders.value.findIndex((o) => o.id === order.id);
			if (orderIndex !== -1) {
				orders.value[orderIndex].status = "refund_return_received";
				orders.value[orderIndex].updatedAt = new Date().toISOString();
			}
			alert("Đã xác nhận nhận hàng hoàn trả! Tiến hành xử lý hoàn tiền.");
		} else {
			alert("Không thể xác nhận nhận hàng hoàn trả. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error confirming return shipment received:', error);
		alert("Có lỗi xảy ra khi xác nhận nhận hàng hoàn trả.");
	}
};

const processRefundPayment = async (order: OrderWithDetails) => {
	try {
		const { useOrders } = await import('@/hook/use-orders');
		const { processRefundPayment } = useOrders();
		const success = await processRefundPayment(order.id);
		if (success) {
			// Update local state
			const orderIndex = orders.value.findIndex((o) => o.id === order.id);
			if (orderIndex !== -1) {
				orders.value[orderIndex].status = "refund_processing";
				orders.value[orderIndex].paymentStatus = "refunded";
				orders.value[orderIndex].updatedAt = new Date().toISOString();
			}
			alert("Đã xử lý hoàn tiền! Đơn hàng hoàn trả hoàn tất.");
		} else {
			alert("Không thể xử lý hoàn tiền. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error processing refund payment:', error);
		alert("Có lỗi xảy ra khi xử lý hoàn tiền.");
	}
};

// Open return shipping approval modal
const openReturnShippingApprovalModal = (orderId: string) => {
	selectedReturnShippingOrder.value = orderId;
	returnShippingAdminResponse.value = "";
	returnShippingPaymentProof.value = [];
	showReturnShippingApprovalModal.value = true;
};

// Handle return shipping approval
const handleReturnShippingApproval = async () => {
	if (!selectedReturnShippingOrder.value || !returnShippingAdminResponse.value.trim()) return;
	
	try {
		isApprovingReturnShipping.value = true;
		
		// Convert payment proof images to base64 if any
		let paymentProofUrls: string[] = [];
		if (returnShippingPaymentProof.value.length > 0) {
			const imagePromises = returnShippingPaymentProof.value.map(file => {
				return new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.readAsDataURL(file);
				});
			});
			paymentProofUrls = await Promise.all(imagePromises);
		}
		
		// Import useOrders hook to approve return shipping
		const { useOrders } = await import('@/hook/use-orders');
		const { approveReturnShipping } = useOrders();
		
		const success = await approveReturnShipping(
			selectedReturnShippingOrder.value, 
			returnShippingAdminResponse.value.trim(),
			paymentProofUrls
		);
		
		if (success) {
			// Close modal on success
			showReturnShippingApprovalModal.value = false;
			selectedReturnShippingOrder.value = "";
			returnShippingAdminResponse.value = "";
			returnShippingPaymentProof.value = [];
			alert("Đã duyệt gửi trả hàng thành công! Tiến hành xử lý hoàn tiền.");
		} else {
			alert("Không thể duyệt gửi trả hàng. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error approving return shipping:', error);
		alert("Có lỗi xảy ra khi duyệt gửi trả hàng.");
	} finally {
		isApprovingReturnShipping.value = false;
	}
};

// Open payment status update modal
const openPaymentStatusModal = (orderId: string, currentPaymentStatus: PaymentStatus) => {
	selectedPaymentOrder.value = orderId;
	selectedPaymentStatus.value = currentPaymentStatus;
	showPaymentStatusModal.value = true;
};

// Handle payment status update
const handlePaymentStatusUpdate = async () => {
	if (!selectedPaymentOrder.value) return;
	
	try {
		// Import useOrders hook to update payment status
		const { useOrders } = await import('@/hook/use-orders');
		const { updatePaymentStatus } = useOrders();
		
		const success = await updatePaymentStatus(selectedPaymentOrder.value, selectedPaymentStatus.value);
		
		if (success) {
			// Close modal on success
			showPaymentStatusModal.value = false;
			selectedPaymentOrder.value = "";
			selectedPaymentStatus.value = "pending";
			
			alert(`Đã cập nhật trạng thái thanh toán thành công!`);
		} else {
			alert("Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.");
		}
	} catch (error) {
		console.error('Error updating payment status:', error);
		alert("Có lỗi xảy ra khi cập nhật trạng thái thanh toán.");
	}
};

// Handle payment proof image upload
const handlePaymentProofUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files) {
		const newFiles = Array.from(target.files);
		returnShippingPaymentProof.value = [...returnShippingPaymentProof.value, ...newFiles];
	}
};

// Remove payment proof image
const removePaymentProofImage = (index: number) => {
	returnShippingPaymentProof.value.splice(index, 1);
};

// Close return shipping approval modal
const closeReturnShippingApprovalModal = () => {
	if (isApprovingReturnShipping.value) return; // Prevent closing while processing
	
	showReturnShippingApprovalModal.value = false;
	selectedReturnShippingOrder.value = "";
	returnShippingAdminResponse.value = "";
	returnShippingPaymentProof.value = [];
};

// Create payment proof image URLs for preview
const paymentProofImageUrls = computed(() => {
	return returnShippingPaymentProof.value.map(file => URL.createObjectURL(file));
});

// Delete order
// const handleDeleteOrder = async (orderId: string) => {
// 	if (confirm("Are you sure you want to delete this order?")) {
// 		await deleteOrder(orderId);
// 	}
// };

// Get status badge color
const getStatusBadgeColor = (status: string) => {
	const statusOption = statusOptions.find(s => s.value === status);
	return statusOption ? `inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusOption.color}` : "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800";
};

// Get payment status badge color
const getPaymentBadgeColor = (status: string) => {
	const statusOption = paymentStatusOptions.find(s => s.value === status);
	return statusOption ? `inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusOption.color}` : "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800";
};

// Get refund status badge color
const getRefundStatusBadgeColor = (status: string) => {
	const refundStatusColors: Record<string, string> = {
		pending: "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800",
		approved: "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800",
		rejected: "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800",
		completed: "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800"
	};
	return refundStatusColors[status] || "inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800";
};

// Get refund status text
const getRefundStatusText = (status: string) => {
	const refundStatusTexts: Record<string, string> = {
		pending: "Chờ duyệt",
		approved: "Đã duyệt",
		rejected: "Từ chối",
		completed: "Hoàn thành"
	};
	return refundStatusTexts[status] || status;
};

onMounted(() => {
	// Orders are already loaded in the hook
});
</script>

<template>
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Orders Management</h1>
			<div class="flex items-center space-x-4">
				<div class="text-sm text-gray-600">
					Total: {{ totalOrders }} orders | Revenue: ${{ actualRevenue.toFixed(2) }} (Expected: ${{ expectedRevenue.toFixed(2) }})
				</div>
				<Button 
					variant="outline" 
					@click="exportUpdatedData"
					class="flex items-center space-x-2"
				>
					<Package class="h-4 w-4" />
					<span>Export Data</span>
				</Button>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-blue-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
							<p class="text-2xl font-bold text-gray-900">{{ totalOrders }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-green-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Doanh thu thực tế</p>
							<p class="text-2xl font-bold text-green-900">${{ actualRevenue.toFixed(2) }}</p>
							<p class="text-xs text-gray-500">Đã giao hàng</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-blue-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Doanh thu dự kiến</p>
							<p class="text-2xl font-bold text-blue-900">${{ expectedRevenue.toFixed(2) }}</p>
							<p class="text-xs text-gray-500">Trừ hủy hàng</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-blue-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Đã nhận đơn</p>
							<p class="text-2xl font-bold text-gray-900">{{ ordersByStatus.received.length }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-yellow-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Đang chuẩn bị</p>
							<p class="text-2xl font-bold text-gray-900">{{ ordersByStatus.preparing.length }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-purple-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Đang giao hàng</p>
							<p class="text-2xl font-bold text-gray-900">{{ ordersByStatus.shipping.length }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardContent class="p-4">
					<div class="flex items-center space-x-2">
						<Package class="h-4 w-4 text-green-600" />
						<div>
							<p class="text-sm font-medium text-gray-600">Đã giao hàng</p>
							<p class="text-2xl font-bold text-gray-900">{{ ordersByStatus.delivered.length }}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Revenue Statistics -->
		<div class="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle class="text-lg text-green-700">Doanh thu thực tế</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold text-green-600">${{ actualRevenue.toFixed(2) }}</div>
					<p class="text-sm text-gray-600 mt-2">Từ đơn hàng đã giao thành công</p>
					<div class="mt-3 text-xs text-gray-500">
						{{ ordersByStatus.delivered.length }} đơn hàng đã giao
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader>
					<CardTitle class="text-lg text-blue-700">Doanh thu dự kiến</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold text-blue-600">${{ expectedRevenue.toFixed(2) }}</div>
					<p class="text-sm text-gray-600 mt-2">Từ tất cả đơn hàng (trừ hủy)</p>
					<div class="mt-3 text-xs text-gray-500">
						{{ totalOrders - ordersByStatus.cancelled.length }} đơn hàng hợp lệ
					</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader>
					<CardTitle class="text-lg text-red-700">Đơn hàng hủy</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold text-red-600">{{ ordersByStatus.cancelled.length }}</div>
					<p class="text-sm text-gray-600 mt-2">Đơn hàng đã hủy</p>
					<div class="mt-3 text-xs text-gray-500">
						${{ (ordersByStatus.cancelled.reduce((sum, o) => sum + o.total, 0)).toFixed(2) }} giá trị bị hủy
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Filters and Search -->
		<Card>
			<CardContent class="p-4">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-1 items-center space-x-2">
						<div class="relative flex-1 max-w-sm">
							<Search class="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
							<Input
								v-model="searchQuery"
								placeholder="Search orders..."
								class="pl-8"
							/>
						</div>
					</div>
					
					<div class="flex items-center space-x-2">
						<select v-model="statusFilter" class="rounded border px-3 py-2 text-sm">
							<option value="">All Status</option>
							<option v-for="status in statusOptions" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
						
						<select v-model="paymentFilter" class="rounded border px-3 py-2 text-sm">
							<option value="">All Payment</option>
							<option v-for="status in paymentStatusOptions" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Orders Table -->
		<Card>
			<CardHeader>
				<CardTitle>Orders</CardTitle>
			</CardHeader>
			<CardContent class="p-0">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Order
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Customer
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Date
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Total
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Status
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Payment
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Cancellation Reason
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Refund Status
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							<tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{{ order.orderNumber }}</div>
									<div class="text-sm text-gray-500">ID: {{ order.id }}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{{ getUserInfo(order.userId).name }}</div>
									<div class="text-sm text-gray-500">{{ getUserInfo(order.userId).email }}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{{ formatDate(order.createdAt) }}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									${{ order.total.toFixed(2) }}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span :class="getStatusBadgeColor(order.status)">
										{{ order.status }}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center space-x-2">
										<span :class="getPaymentBadgeColor(order.paymentStatus)">
											{{ order.paymentStatus }}
										</span>
										
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									<div v-if="order.status === 'cancelled'">
										<span class="text-red-600 font-medium">{{ (order as any).cancellationReason || 'N/A' }}</span>
									</div>
									<div v-else class="text-gray-400">
										-
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									<div v-if="(order as any).refundRequest">
										<span :class="getRefundStatusBadgeColor((order as any).refundRequest.status)">
											{{ getRefundStatusText((order as any).refundRequest.status) }}
										</span>
									</div>
									<div v-else class="text-gray-400">
										-
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											@click="viewOrder(order.id)"
										>
											<Eye class="h-4 w-4" />
										</Button>
										
										<Button
											variant="outline"
											size="sm"
											@click="openStatusModal(order.id, order.status as OrderStatus)"
										>
											<Edit class="h-4 w-4" />
										</Button>
										
										<!-- Refund Action Button -->
										<Button
											v-if="(order as any).refundRequest && (order as any).refundRequest.status === 'pending'"
											variant="outline"
											size="sm"
											class="text-orange-600 border-orange-200 hover:bg-orange-50"
											@click="openRefundModal(order.id)"
										>
											<Clock class="h-4 w-4" />
										</Button>
										
										<!-- Confirm Return Shipment Received Button -->
										<Button
											v-if="order.status === 'refund_return_shipping'"
											variant="outline"
											size="sm"
											class="text-purple-600 border-purple-200 hover:bg-purple-50"
											@click="() => {
												const orderDetails = getOrderWithDetails(order.id);
												if (orderDetails) confirmReturnShipmentReceived(orderDetails);
											}"
										>
											<Package class="h-4 w-4" />
										</Button>
										
										<!-- Process Refund Payment Button -->
										<Button
											v-if="order.status === 'refund_return_received'"
											variant="outline"
											size="sm"
											class="text-blue-600 border-blue-200 hover:bg-blue-50"
											@click="() => {
												const orderDetails = getOrderWithDetails(order.id);
												if (orderDetails) processRefundPayment(orderDetails);
											}"
										>
											<Package class="h-4 w-4" />
										</Button>

										<!-- Return Shipping Approval Button -->
										<Button
											v-if="order.status === 'refund_return_shipping'"
											variant="outline"
											size="sm"
											class="text-purple-600 border-purple-200 hover:bg-purple-50"
											@click="openReturnShippingApprovalModal(order.id)"
										>
											<Package class="h-4 w-4" />
										</Button>
										
										<!-- Payment Status Update Button -->
										<Button
											variant="outline"
											size="sm"
											class="text-blue-600 border-blue-200 hover:bg-blue-50"
											@click="openPaymentStatusModal(order.id, order.paymentStatus as PaymentStatus)"
											title="Cập nhật trạng thái thanh toán"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card">
												<rect width="20" height="14" x="2" y="5" rx="2"/>
												<line x1="2" x2="22" y1="10" y2="10"/>
											</svg>
										</Button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>

		<!-- Order Details Modal -->
		<div v-if="showOrderModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-4xl rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-semibold">Order Details: {{ selectedOrder.orderNumber }}</h2>
					<Button variant="outline" @click="showOrderModal = false">Close</Button>
				</div>
				
				<!-- Order Info -->
				<div class="grid gap-4 md:grid-cols-2 mb-6">
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Order Information</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Order Number:</span>
								<span class="font-medium">{{ selectedOrder.orderNumber }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Date:</span>
								<span class="font-medium">{{ formatDate(selectedOrder.createdAt) }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Status:</span>
								<span :class="getStatusBadgeColor(selectedOrder.status)">
									{{ selectedOrder.status }}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Payment Status:</span>
								<span :class="getPaymentBadgeColor(selectedOrder.paymentStatus)">
									{{ selectedOrder.paymentStatus }}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Payment Method:</span>
								<span class="font-medium">{{ getPaymentMethodName(selectedOrder.paymentMethod) }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Currency:</span>
								<span class="font-medium">{{ selectedOrder.currency }}</span>
							</div>
							<div v-if="selectedOrder.status === 'cancelled' && (selectedOrder as any).cancellationReason" class="flex justify-between">
								<span class="text-gray-600">Lý do hủy hàng:</span>
								<span class="font-medium text-red-600">{{ (selectedOrder as any).cancellationReason }}</span>
							</div>
							<div v-else-if="selectedOrder.status === 'cancelled'" class="flex justify-between">
								<span class="text-gray-600">Lý do hủy hàng:</span>
								<span class="font-medium text-red-400 italic">Chưa có lý do</span>
							</div>
						</CardContent>
					</Card>
					
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Customer Information</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Name:</span>
								<span class="font-medium">{{ selectedOrder.user.firstName }} {{ selectedOrder.user.lastName }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Email:</span>
								<span class="font-medium">{{ selectedOrder.user.email }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Phone:</span>
								<span class="font-medium">{{ selectedOrder.user.phone }}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Cancellation Information (if cancelled) -->
				<div v-if="selectedOrder.status === 'cancelled'" class="mb-6">
					<Card class="border-red-200 bg-red-50">
						<CardHeader>
							<CardTitle class="text-lg text-red-800">Thông tin hủy hàng</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-red-700 font-medium">Trạng thái:</span>
									<span class="font-bold text-red-800">Đã hủy hàng</span>
								</div>
								<div class="flex justify-between">
									<span class="text-red-700 font-medium">Lý do hủy hàng:</span>
									<span class="font-medium text-red-800">
										{{ (selectedOrder as any).cancellationReason || 'Chưa có lý do' }}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-red-700 font-medium">Thời gian cập nhật:</span>
									<span class="font-medium text-red-800">{{ formatDate(selectedOrder.updatedAt) }}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Refund Information (if exists) -->
				<div v-if="(selectedOrder as any).refundRequest" class="mb-6">
					<Card class="border-orange-200 bg-orange-50">
						<CardHeader>
							<CardTitle class="text-lg text-orange-800">Thông tin yêu cầu hoàn trả</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="flex justify-between">
										<span class="text-orange-700 font-medium">Trạng thái:</span>
										<span :class="getRefundStatusBadgeColor((selectedOrder as any).refundRequest.status)">
											{{ getRefundStatusText((selectedOrder as any).refundRequest.status) }}
										</span>
									</div>
									<div class="flex justify-between">
										<span class="text-orange-700 font-medium">Ngày yêu cầu:</span>
										<span class="font-medium text-orange-800">{{ formatDate((selectedOrder as any).refundRequest.requestedAt) }}</span>
									</div>
								</div>
								
								<div class="space-y-2">
									<span class="text-orange-700 font-medium">Lý do hoàn trả:</span>
									<p class="text-orange-800 bg-white p-3 rounded border">{{ (selectedOrder as any).refundRequest.reason }}</p>
								</div>
								
								<!-- Refund Images -->
								<div v-if="(selectedOrder as any).refundRequest.images && (selectedOrder as any).refundRequest.images.length > 0" class="space-y-2">
									<span class="text-orange-700 font-medium">Ảnh minh chứng:</span>
									<div class="grid grid-cols-4 gap-2">
										<div v-for="(image, index) in (selectedOrder as any).refundRequest.images" :key="index">
											<img 
												:src="image" 
												:alt="`Refund image ${index + 1}`"
												class="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
												@click="() => console.log('View image:', image)"
											/>
										</div>
									</div>
								</div>
								
								<!-- Admin Response -->
								<div v-if="(selectedOrder as any).refundRequest.adminResponse" class="space-y-2">
									<span class="text-orange-700 font-medium">Phản hồi admin:</span>
									<p class="text-orange-800 bg-white p-3 rounded border">{{ (selectedOrder as any).refundRequest.adminResponse }}</p>
								</div>
								
								<!-- Process Date -->
								<div v-if="(selectedOrder as any).refundRequest.processedAt" class="flex justify-between">
									<span class="text-orange-700 font-medium">Ngày xử lý:</span>
									<span class="font-medium text-orange-800">{{ formatDate((selectedOrder as any).refundRequest.processedAt) }}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Return Shipping Information (if exists) -->
				<div v-if="(selectedOrder as any).returnShippingInfo" class="mb-6">
					<Card class="border-purple-200 bg-purple-50">
						<CardHeader>
							<CardTitle class="text-lg text-purple-800">Thông tin gửi trả hàng</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="flex justify-between">
										<span class="text-purple-700 font-medium">Mã vận chuyển:</span>
										<span class="font-medium text-purple-800">{{ (selectedOrder as any).returnShippingInfo.trackingNumber }}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-purple-700 font-medium">Công ty vận chuyển:</span>
										<span class="font-medium text-purple-800">{{ (selectedOrder as any).returnShippingInfo.shippingCompany }}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-purple-700 font-medium">Ngày gửi:</span>
										<span class="font-medium text-purple-800">{{ formatDate((selectedOrder as any).returnShippingInfo.shippingDate) }}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-purple-700 font-medium">Dự kiến nhận:</span>
										<span class="font-medium text-purple-800">{{ formatDate((selectedOrder as any).returnShippingInfo.estimatedDelivery) }}</span>
									</div>
								</div>
								
								<!-- Return Shipping Images -->
								<div v-if="(selectedOrder as any).returnShippingInfo.shippingImages && (selectedOrder as any).returnShippingInfo.shippingImages.length > 0" class="space-y-2">
									<span class="text-purple-700 font-medium">Ảnh minh chứng gói hàng:</span>
									<div class="grid grid-cols-4 gap-2">
										<div v-for="(image, index) in (selectedOrder as any).returnShippingInfo.shippingImages" :key="index">
											<img 
												:src="image" 
												:alt="`Return shipping image ${index + 1}`"
												class="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
												@click="() => console.log('View image:', image)"
											/>
										</div>
									</div>
								</div>
								
								<!-- Notes -->
								<div v-if="(selectedOrder as any).returnShippingInfo.notes" class="space-y-2">
									<span class="text-purple-700 font-medium">Ghi chú:</span>
									<p class="text-purple-800 bg-white p-3 rounded border">{{ (selectedOrder as any).returnShippingInfo.notes }}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Refund Process Status Information -->
				<div v-if="selectedOrder.status.startsWith('refund_')" class="mb-6">
					<Card class="border-blue-200 bg-blue-50">
						<CardHeader>
							<CardTitle class="text-lg text-blue-800">Trạng thái quy trình hoàn trả</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								<div v-if="selectedOrder.status === 'refund_approved'">
									<div class="flex items-center space-x-2 text-green-700">
										<span class="text-lg">✅</span>
										<span class="font-medium">Yêu cầu hoàn trả đã được duyệt</span>
									</div>
									<p class="text-blue-700 mt-2">Khách hàng sẽ gửi trả hàng theo hướng dẫn. Vui lòng chờ thông tin gửi trả hàng từ khách hàng.</p>
								</div>
								
								<div v-else-if="selectedOrder.status === 'refund_return_shipping'">
									<div class="flex items-center space-x-2 text-orange-700">
										<span class="text-lg">📦</span>
										<span class="font-medium">Khách hàng đã gửi trả hàng</span>
									</div>
									<p class="text-blue-700 mt-2">Hàng đang được vận chuyển về kho. Khi nhận được hàng, hãy xác nhận để tiến hành xử lý hoàn tiền.</p>
									<div class="mt-3">
										<Button 
											@click="confirmReturnShipmentReceived(selectedOrder)"
											variant="outline"
											class="text-purple-600 border-purple-200 hover:bg-purple-50"
										>
											<Package class="w-4 h-4 mr-2" />
											Xác nhận đã nhận hàng hoàn trả
										</Button>
									</div>
								</div>
								
								<div v-else-if="selectedOrder.status === 'refund_return_received'">
									<div class="flex items-center space-x-2 text-purple-700">
										<span class="text-lg">📦</span>
										<span class="font-medium">Đã nhận hàng hoàn trả</span>
									</div>
									<p class="text-blue-700 mt-2">Hàng hoàn trả đã được nhận và kiểm tra. Tiến hành xử lý hoàn tiền cho khách hàng.</p>
									<div class="mt-3">
										<Button 
											@click="processRefundPayment(selectedOrder)"
											variant="outline"
											class="text-blue-600 border-blue-200 hover:bg-blue-50"
										>
											<Package class="w-4 h-4 mr-2" />
											Xử lý hoàn tiền
										</Button>
									</div>
								</div>
								
								<div v-else-if="selectedOrder.status === 'refund_processing'">
									<div class="flex items-center space-x-2 text-blue-700">
										<span class="text-lg">💰</span>
										<span class="font-medium">Đang xử lý hoàn tiền</span>
									</div>
									<p class="text-blue-700 mt-2">Hoàn tiền đang được xử lý. Quá trình sẽ hoàn tất sớm.</p>
								</div>
								
								<div v-else-if="selectedOrder.status === 'refund_completed'">
									<div class="flex items-center space-x-2 text-green-700">
										<span class="text-lg">✅</span>
										<span class="font-medium">Hoàn trả đã hoàn tất</span>
									</div>
									<p class="text-blue-700 mt-2">Quá trình hoàn trả đã hoàn tất. Khách hàng đã nhận được tiền hoàn trả.</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<!-- Address Information -->
				<div class="grid gap-4 md:grid-cols-2 mb-6">
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Shipping Address</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Name:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).fullName }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Phone:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).phone }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Address:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).address }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">City:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).city }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">State:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).state }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">ZIP Code:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).zipCode }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Country:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.shippingAddressId).country }}</span>
							</div>
						</CardContent>
					</Card>
					
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">Billing Address</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Name:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).fullName }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Phone:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).phone }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Address:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).address }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">City:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).city }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">State:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).state }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">ZIP Code:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).zipCode }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Country:</span>
								<span class="font-medium">{{ getAddressInfo(selectedOrder.billingAddressId).country }}</span>
							</div>
						</CardContent>
					</Card>
				</div>
				
				<!-- Order Items -->
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Order Items</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div v-for="item in selectedOrder.items" :key="item.id" class="flex items-center space-x-4 p-4 border rounded">
								<img 
									:src="item.product.images?.[0] || '/placeholder.jpg'" 
									:alt="item.product.name"
									class="w-16 h-16 object-cover rounded"
								/>
								<div class="flex-1">
									<h4 class="font-medium">{{ item.product.name }}</h4>
									<p class="text-sm text-gray-600">SKU: {{ item.productSku }}</p>
									<p class="text-sm text-gray-600">Size: {{ item.size }} | Color: {{ item.color }}</p>
								</div>
								<div class="text-right">
									<p class="font-medium">${{ item.unitPrice.toFixed(2) }}</p>
									<p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
									<p class="font-medium text-blue-600">${{ item.totalPrice.toFixed(2) }}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				
				<!-- Order Summary -->
				<Card class="mt-6">
					<CardHeader>
						<CardTitle class="text-lg">Order Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Subtotal:</span>
								<span>${{ selectedOrder.subtotal.toFixed(2) }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Tax:</span>
								<span>${{ selectedOrder.tax.toFixed(2) }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Shipping:</span>
								<span>${{ selectedOrder.shipping.toFixed(2) }}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Discount:</span>
								<span>${{ selectedOrder.discount.toFixed(2) }}</span>
							</div>
							<Separator />
							<div class="flex justify-between font-bold text-lg">
								<span>Total:</span>
								<span>${{ selectedOrder.total.toFixed(2) }}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Status Update Modal -->
		<div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<h2 class="text-xl font-semibold mb-4">Cập nhật trạng thái đơn hàng</h2>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái mới</label>
						<select v-model="selectedStatus" @change="handleStatusChange" class="w-full rounded border px-3 py-2">
							<option v-for="status in statusOptions" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
					</div>
					
					<div v-if="showCancellationReason" class="space-y-2">
						<label class="block text-sm font-medium text-red-700 mb-2">
							Lý do hủy hàng <span class="text-red-500">*</span>
						</label>
						<textarea 
							v-model="cancellationReason" 
							class="w-full rounded border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500" 
							rows="3" 
							placeholder="Nhập lý do hủy hàng (bắt buộc)..."
							required
						></textarea>
						<p class="text-xs text-red-600">Lý do hủy hàng là bắt buộc khi chọn trạng thái "Hủy hàng"</p>
					</div>

					<div class="flex justify-end space-x-2">
						<Button variant="outline" @click="showStatusModal = false">Hủy</Button>
						<Button 
							@click="handleStatusUpdate"
							:disabled="selectedStatus === 'cancelled' && !cancellationReason.trim()"
							:class="selectedStatus === 'cancelled' && !cancellationReason.trim() ? 'opacity-50 cursor-not-allowed' : ''"
						>
							Cập nhật trạng thái
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Refund Modal -->
		<div v-if="showRefundModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<h2 class="text-xl font-semibold mb-4">Xử lý yêu cầu hoàn trả</h2>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Hành động</label>
						<select v-model="refundAction" class="w-full rounded border px-3 py-2">
							<option value="approve">Duyệt hoàn trả</option>
							<option value="reject">Từ chối hoàn trả</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Phản hồi <span class="text-red-500">*</span>
						</label>
						<textarea 
							v-model="adminResponse" 
							class="w-full rounded border px-3 py-2 text-sm" 
							rows="3" 
							placeholder="Nhập phản hồi của bạn..."
							required
						></textarea>
					</div>

					<div class="flex justify-end space-x-2">
						<Button variant="outline" @click="showRefundModal = false">Hủy</Button>
						<Button 
							@click="handleRefundAction"
							:disabled="!adminResponse.trim()"
							:class="refundAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
						>
							{{ refundAction === 'approve' ? 'Duyệt' : 'Từ chối' }}
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Return Shipping Approval Modal -->
		<div v-if="showReturnShippingApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<h2 class="text-xl font-semibold mb-4">Duyệt gửi trả hàng</h2>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Phản hồi <span class="text-red-500">*</span>
						</label>
						<textarea 
							v-model="returnShippingAdminResponse" 
							class="w-full rounded border px-3 py-2 text-sm" 
							rows="3" 
							placeholder="Nhập phản hồi của bạn..."
							required
						></textarea>
					</div>

					<div v-if="returnShippingPaymentProof.length > 0" class="space-y-2">
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Ảnh minh chứng <span class="text-red-500">*</span> (nếu có)
						</label>
						<input 
							type="file" 
							accept="image/*" 
							@change="handlePaymentProofUpload"
							class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
						<div v-if="returnShippingPaymentProof.length > 0" class="mt-2 grid grid-cols-4 gap-2">
							<div v-for="(image, index) in returnShippingPaymentProof" :key="index" class="relative">
								<img :src="paymentProofImageUrls[index]" alt="Payment proof" class="w-full h-20 object-cover rounded border">
								<button 
									type="button" 
									@click="removePaymentProofImage(index)"
									class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
									title="Remove image"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
								</button>
							</div>
						</div>
					</div>

					<div class="flex justify-end space-x-2">
						<Button variant="outline" @click="closeReturnShippingApprovalModal">Hủy</Button>
						<Button 
							@click="handleReturnShippingApproval"
							:disabled="!returnShippingAdminResponse.trim() || (returnShippingPaymentProof.length === 0 && returnShippingPaymentProof.length === 0)"
							:class="isApprovingReturnShipping ? 'opacity-50 cursor-not-allowed' : ''"
						>
							{{ isApprovingReturnShipping ? 'Đang xử lý...' : 'Duyệt' }}
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Payment Status Update Modal -->
		<div v-if="showPaymentStatusModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<h2 class="text-xl font-semibold mb-4">Cập nhật trạng thái thanh toán</h2>
				
				<div class="space-y-4">
					<!-- Order Info -->
					<div v-if="selectedPaymentOrder" class="bg-gray-50 border border-gray-200 rounded-lg p-3">
						<div class="text-sm text-gray-600">
							<strong>Đơn hàng:</strong> {{ orders.find(o => o.id === selectedPaymentOrder)?.orderNumber || 'N/A' }}
						</div>
						<div class="text-sm text-gray-600">
							<strong>Trạng thái hiện tại:</strong> 
							<span :class="getPaymentBadgeColor(orders.find(o => o.id === selectedPaymentOrder)?.paymentStatus || '')">
								{{ orders.find(o => o.id === selectedPaymentOrder)?.paymentStatus || 'N/A' }}
							</span>
						</div>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái thanh toán mới</label>
						<select v-model="selectedPaymentStatus" class="w-full rounded border px-3 py-2">
							<option v-for="status in paymentStatusOptions" :key="status.value" :value="status.value">
								{{ status.label }}
							</option>
						</select>
					</div>
					
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<div class="flex items-center space-x-2 text-blue-800">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info">
								<circle cx="12" cy="12" r="10"/>
								<path d="m9 12 3 3 3-3"/>
								<path d="M12 6v.01"/>
							</svg>
							<span class="text-sm font-medium">Thông tin</span>
						</div>
						<p class="text-sm text-blue-700 mt-1">
							Chọn trạng thái thanh toán mới cho đơn hàng này. Thay đổi này sẽ được cập nhật ngay lập tức.
						</p>
					</div>

					<div class="flex justify-end space-x-2">
						<Button variant="outline" @click="showPaymentStatusModal = false">Hủy</Button>
						<Button 
							@click="handlePaymentStatusUpdate"
							class="bg-blue-600 hover:bg-blue-700 text-white"
						>
							Cập nhật trạng thái thanh toán
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Test Refund System -->
		<!-- <Card class="mt-6">
			<CardHeader>
				<CardTitle>Test Refund System</CardTitle>
			</CardHeader>
			<CardContent>
				<TestRefund />
			</CardContent>
		</Card> -->

		<!-- Debug Information -->
		
	</div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
