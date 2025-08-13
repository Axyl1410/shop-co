import { ref, computed } from "vue";
import axios from "axios";
import { ServerAxiosConfig } from "@/constant";
import { toast } from "vue-sonner";
import data from "@/../data.json";
import type { Order, OrderItem, User, Product, ProductVariant } from "@/types";

// Types for order management
export type OrderStatus = "received" | "preparing" | "shipping" | "delivered" | "cancelled" | "refund_approved" | "refund_return_shipping" | "refund_return_shipping_pending" | "refund_return_shipping_approved" | "refund_return_received" | "refund_processing" | "refund_completed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderWithDetails extends Order {
	user: User;
	items: OrderItemWithProduct[];
	cancellationReason?: string;
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
	};
}

export interface OrderItemWithProduct extends OrderItem {
	product: Product;
	variant: ProductVariant;
}

// State
const orders = ref<Order[]>([]);
const isLoading = ref(false);
const selectedOrder = ref<OrderWithDetails | null>(null);
const showOrderModal = ref(false);
const showStatusModal = ref(false);

// Load orders from API
const loadOrders = async () => {
	try {
		isLoading.value = true;
		const response = await axios.get(`${ServerAxiosConfig.baseURL}/orders`);
		orders.value = response.data;
		console.log('Orders loaded from API:', orders.value);
	} catch (error) {
		console.error('Error loading orders from API:', error);
		// Fallback to data.json
		orders.value = (data.orders || []) as Order[];
		toast.error('Không thể kết nối API, sử dụng dữ liệu local');
	} finally {
		isLoading.value = false;
	}
};

// Get order with full details
const getOrderWithDetails = (orderId: string): OrderWithDetails | null => {
	const order = data.orders.find(o => o.id === orderId);
	if (!order) return null;

	const user = data.users.find(u => u.id.toString() === order.userId.toString());
	if (!user) return null;

	const orderItems = data.order_items.filter(oi => oi.orderId.toString() === order.id.toString());
	
	const items: OrderItemWithProduct[] = orderItems.map(item => {
		const variant = data.product_variants.find(v => v.id.toString() === item.productVariantId.toString());
		const product = data.products.find(p => p.id.toString() === (variant?.productId || ""));
		
		return {
			...item,
			product: (product || {}) as Product,
			variant: (variant || {}) as ProductVariant,
		} as unknown as OrderItemWithProduct;
	});

	return {
		...order,
		user: user as unknown as User,
		items,
	} as OrderWithDetails;
};

// Update order status
const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, cancellationReason?: string) => {
	try {
		isLoading.value = true;
		
		console.log(`Updating order ${orderId} to status: ${newStatus}`);
		if (cancellationReason) {
			console.log(`Cancellation reason: ${cancellationReason}`);
		}
		
		// Prepare update payload
		const updatePayload: Record<string, unknown> = {
			status: newStatus,
			updatedAt: new Date().toISOString()
		};
		
		// Add cancellation reason if status is cancelled
		if (newStatus === "cancelled" && cancellationReason) {
			updatePayload.cancellationReason = cancellationReason;
		}
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, updatePayload);
		const updatedOrder = response.data;
		
		console.log(`Order ${orderId} status updated via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		console.log(`Local state updated successfully`);
		console.log(`Total orders: ${orders.value.length}`);
		console.log(`Orders by status:`, ordersByStatus.value);
		
		toast.success(`Order status updated to ${newStatus} - Đã cập nhật qua API!`);
		showStatusModal.value = false;
		
		return true; // Return success
	} catch (error) {
		console.error("Error updating order status via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			data.orders[orderIndex].status = newStatus;
			data.orders[orderIndex].updatedAt = new Date().toISOString();
			
			if (newStatus === "cancelled" && cancellationReason) {
				(data.orders[orderIndex] as Record<string, unknown>).cancellationReason = cancellationReason;
			}
			
			// Update local state
			const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
			if (localOrderIndex !== -1) {
				orders.value[localOrderIndex].status = newStatus;
				orders.value[localOrderIndex].updatedAt = new Date().toISOString();
				if (newStatus === "cancelled" && cancellationReason) {
					(orders.value[localOrderIndex] as Record<string, unknown>).cancellationReason = cancellationReason;
				}
			}
			
			orders.value = [...orders.value];
			toast.success(`Order status updated to ${newStatus} - Đã cập nhật local (API thất bại)`);
			
			return true; // Return success for local update
		}
		
		return false; // Return failure if no order found
	} finally {
		isLoading.value = false;
	}
};

// Submit refund request
const submitRefundRequest = async (orderId: string, refundData: {
	reason: string;
	images: string[];
}) => {
	try {
		isLoading.value = true;
		
		console.log(`Submitting refund request for order ${orderId}:`, refundData);
		
		// Prepare refund request payload
		const refundRequest = {
			refundRequest: {
				status: "pending" as const,
				reason: refundData.reason,
				images: refundData.images,
				requestedAt: new Date().toISOString(),
			},
			updatedAt: new Date().toISOString()
		};
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, refundRequest);
		const updatedOrder = response.data;
		
		console.log(`Refund request submitted via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		toast.success("Yêu cầu hoàn trả đã được gửi thành công! Vui lòng chờ admin duyệt.");
		return true;
	} catch (error) {
		console.error("Error submitting refund request via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			(data.orders[orderIndex] as Record<string, unknown>).refundRequest = {
				status: "pending",
				reason: refundData.reason,
				images: refundData.images,
				requestedAt: new Date().toISOString(),
			};
			data.orders[orderIndex].updatedAt = new Date().toISOString();
			
			// Update local state
			const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
			if (localOrderIndex !== -1) {
				(orders.value[localOrderIndex] as Record<string, unknown>).refundRequest = {
					status: "pending",
					reason: refundData.reason,
					images: refundData.images,
					requestedAt: new Date().toISOString(),
				};
				orders.value[localOrderIndex].updatedAt = new Date().toISOString();
			}
			
			orders.value = [...orders.value];
			toast.success("Yêu cầu hoàn trả đã được gửi thành công! (API thất bại, đã lưu local)");
			return true;
		}
		
		toast.error("Không thể gửi yêu cầu hoàn trả. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Submit return shipping information (user action)
const submitReturnShippingInfo = async (orderId: string, returnData: {
	trackingNumber: string;
	shippingCompany: string;
	shippingImages: string[];
	estimatedDelivery: string;
	notes?: string;
}) => {
	try {
		isLoading.value = true;
		
		console.log(`Submitting return shipping info for order ${orderId}:`, returnData);
		
		// Prepare return shipping payload
		const returnShippingPayload = {
			returnShippingInfo: {
				trackingNumber: returnData.trackingNumber,
				shippingCompany: returnData.shippingCompany,
				shippingImages: returnData.shippingImages,
				shippingDate: new Date().toISOString(),
				estimatedDelivery: returnData.estimatedDelivery,
				notes: returnData.notes,
			},
			status: "refund_return_shipping_pending", // Changed to pending approval
			updatedAt: new Date().toISOString()
		};
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, returnShippingPayload);
		const updatedOrder = response.data;
		
		console.log(`Return shipping info submitted via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		toast.success("Thông tin gửi trả hàng đã được gửi thành công! Admin sẽ kiểm tra và duyệt.");
		return true;
	} catch (error) {
		console.error("Error submitting return shipping info via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			(data.orders[orderIndex] as Record<string, unknown>).returnShippingInfo = {
				trackingNumber: returnData.trackingNumber,
				shippingCompany: returnData.shippingCompany,
				shippingImages: returnData.shippingImages,
				shippingDate: new Date().toISOString(),
				estimatedDelivery: returnData.estimatedDelivery,
				notes: returnData.notes,
			};
			data.orders[orderIndex].status = "refund_return_shipping_pending"; // Changed to pending approval
			data.orders[orderIndex].updatedAt = new Date().toISOString();
			
			// Update local state
			const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
			if (localOrderIndex !== -1) {
				(orders.value[localOrderIndex] as Record<string, unknown>).returnShippingInfo = {
					trackingNumber: returnData.trackingNumber,
					shippingCompany: returnData.shippingCompany,
					shippingImages: returnData.shippingImages,
					shippingDate: new Date().toISOString(),
					estimatedDelivery: returnData.estimatedDelivery,
					notes: returnData.notes,
				};
				orders.value[localOrderIndex].status = "refund_return_shipping_pending"; // Changed to pending approval
				orders.value[localOrderIndex].updatedAt = new Date().toISOString();
			}
			
			orders.value = [...orders.value];
			toast.success("Thông tin gửi trả hàng đã được gửi thành công! (API thất bại, đã lưu local)");
			return true;
		}
		
		toast.error("Không thể gửi thông tin gửi trả hàng. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Process refund request (admin action)
const processRefundRequest = async (orderId: string, action: "approve" | "reject", adminResponse: string) => {
	try {
		isLoading.value = true;
		
		console.log(`Processing refund request for order ${orderId}: ${action}`);
		
		// Get current order to find existing refund request
		const order = orders.value.find(o => o.id === orderId);
		if (!order || !(order as Record<string, unknown>).refundRequest) {
			toast.error("Không tìm thấy yêu cầu hoàn trả");
			return false;
		}
		
		const currentRefund = (order as Record<string, unknown>).refundRequest as Record<string, unknown>;
		
		// Prepare update payload
		const updatePayload: Record<string, unknown> = {
			refundRequest: {
				...currentRefund,
				status: action === "approve" ? "approved" : "rejected",
				adminResponse,
				processedAt: new Date().toISOString(),
			},
			updatedAt: new Date().toISOString()
		};
		
		// If approving refund, change order status to refund_approved
		if (action === "approve") {
			updatePayload.status = "refund_approved";
		}
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, updatePayload);
		const updatedOrder = response.data;
		
		console.log(`Refund request processed via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		if (action === "approve") {
			toast.success("Yêu cầu hoàn trả đã được duyệt! User sẽ gửi trả hàng.");
		} else {
			toast.success("Yêu cầu hoàn trả đã được từ chối!");
		}
		return true;
	} catch (error) {
		console.error("Error processing refund request via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			const currentRefund = (data.orders[orderIndex] as Record<string, unknown>).refundRequest as Record<string, unknown>;
			if (currentRefund) {
				(data.orders[orderIndex] as Record<string, unknown>).refundRequest = {
					...currentRefund,
					status: action === "approve" ? "approved" : "rejected",
					adminResponse,
					processedAt: new Date().toISOString(),
				};
				data.orders[orderIndex].updatedAt = new Date().toISOString();
				
				// If approving refund, change order status
				if (action === "approve") {
					data.orders[orderIndex].status = "refund_approved";
				}
				
				// Update local state
				const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
				if (localOrderIndex !== -1) {
					(orders.value[localOrderIndex] as Record<string, unknown>).refundRequest = {
						...currentRefund,
						status: action === "approve" ? "approved" : "rejected",
						adminResponse,
						processedAt: new Date().toISOString(),
					};
					orders.value[localOrderIndex].updatedAt = new Date().toISOString();
					
					if (action === "approve") {
						orders.value[localOrderIndex].status = "refund_approved";
					}
				}
				
				orders.value = [...orders.value];
				if (action === "approve") {
					toast.success("Yêu cầu hoàn trả đã được duyệt! Đơn hàng chuyển sang trạng thái xử lý hoàn trả. (API thất bại, đã lưu local)");
				} else {
					toast.success("Yêu cầu hoàn trả đã được từ chối! (API thất bại, đã lưu local)");
				}
				return true;
			}
		}
		
		toast.error("Không thể xử lý yêu cầu hoàn trả. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Confirm return shipment received (admin action)
const confirmReturnShipmentReceived = async (orderId: string) => {
	try {
		isLoading.value = true;
		
		console.log(`Confirming return shipment received for order ${orderId}`);
		
		// Update order status to refund_return_received
		const updatePayload = {
			status: "refund_return_received",
			updatedAt: new Date().toISOString()
		};
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, updatePayload);
		const updatedOrder = response.data;
		
		console.log(`Return shipment confirmed via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		toast.success("Đã xác nhận nhận hàng hoàn trả! Tiến hành xử lý hoàn tiền.");
		return true;
	} catch (error) {
		console.error("Error confirming return shipment received via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			data.orders[orderIndex].status = "refund_return_received";
			data.orders[orderIndex].updatedAt = new Date().toISOString();
			
			// Update local state
			const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
			if (localOrderIndex !== -1) {
				orders.value[localOrderIndex].status = "refund_return_received";
				orders.value[localOrderIndex].updatedAt = new Date().toISOString();
			}
			
			orders.value = [...orders.value];
			toast.success("Đã xác nhận nhận hàng hoàn trả! (API thất bại, đã lưu local)");
			return true;
		}
		
		toast.error("Không thể xác nhận nhận hàng hoàn trả. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Process refund payment (admin action)
const processRefundPayment = async (orderId: string) => {
	try {
		isLoading.value = true;
		
		console.log(`Processing refund payment for order ${orderId}`);
		
		// Update order status to refund_processing and payment status to refunded
		const updatePayload = {
			status: "refund_processing",
			paymentStatus: "refunded",
			updatedAt: new Date().toISOString()
		};
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, updatePayload);
		const updatedOrder = response.data;
		
		console.log(`Refund payment processed via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		toast.success("Đã xử lý hoàn tiền! Đơn hàng hoàn trả hoàn tất.");
		return true;
	} catch (error) {
		console.error("Error processing refund payment via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			data.orders[orderIndex].status = "refund_processing";
			data.orders[orderIndex].paymentStatus = "refunded";
			data.orders[orderIndex].updatedAt = new Date().toISOString();
			
			// Update local state
			const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
			if (localOrderIndex !== -1) {
				orders.value[localOrderIndex].status = "refund_processing";
				orders.value[localOrderIndex].paymentStatus = "refunded";
				orders.value[localOrderIndex].updatedAt = new Date().toISOString();
			}
			
			orders.value = [...orders.value];
			toast.success("Đã xử lý hoàn tiền! (API thất bại, đã lưu local)");
			return true;
		}
		
		toast.error("Không thể xử lý hoàn tiền. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Approve return shipping and proceed with payment (admin action)
const approveReturnShipping = async (orderId: string, adminResponse: string, paymentProof?: string[]) => {
	try {
		isLoading.value = true;
		
		console.log(`Approving return shipping for order ${orderId}`);
		
		// Get current order to find existing return shipping info
		const order = orders.value.find(o => o.id === orderId);
		if (!order || !(order as Record<string, unknown>).returnShippingInfo) {
			toast.error("Không tìm thấy thông tin gửi trả hàng");
			return false;
		}
		
		const currentReturnShipping = (order as Record<string, unknown>).returnShippingInfo as Record<string, unknown>;
		
		// Prepare update payload
		const updatePayload: Record<string, unknown> = {
			returnShippingInfo: {
				...currentReturnShipping,
				adminApproval: {
					approved: true,
					adminResponse,
					processedAt: new Date().toISOString(),
					adminId: "admin", // You can replace this with actual admin ID
				},
			},
			status: "refund_return_shipping_approved", // New status
			updatedAt: new Date().toISOString()
		};
		
		// Add payment proof if provided
		if (paymentProof && paymentProof.length > 0) {
			(updatePayload.returnShippingInfo as Record<string, unknown>).paymentProof = paymentProof;
		}
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, updatePayload);
		const updatedOrder = response.data;
		
		console.log(`Return shipping approved via API:`, updatedOrder);
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		// Force reactivity update
		orders.value = [...orders.value];
		
		toast.success("Đã duyệt gửi trả hàng! Tiến hành xử lý hoàn tiền.");
		return true;
	} catch (error) {
		console.error("Error approving return shipping via API:", error);
		
		// Fallback to local update if API fails
		console.log("Falling back to local update...");
		const orderIndex = data.orders.findIndex(o => o.id === orderId);
		if (orderIndex !== -1) {
			const currentReturnShipping = (data.orders[orderIndex] as Record<string, unknown>).returnShippingInfo as Record<string, unknown>;
			if (currentReturnShipping) {
				(data.orders[orderIndex] as Record<string, unknown>).returnShippingInfo = {
					...currentReturnShipping,
					adminApproval: {
						approved: true,
						adminResponse,
						processedAt: new Date().toISOString(),
						adminId: "admin",
					},
				};
				data.orders[orderIndex].status = "refund_return_shipping_approved";
				data.orders[orderIndex].updatedAt = new Date().toISOString();
				
				// Update local state
				const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
				if (localOrderIndex !== -1) {
					(orders.value[localOrderIndex] as Record<string, unknown>).returnShippingInfo = {
						...currentReturnShipping,
						adminApproval: {
							approved: true,
							adminResponse,
							processedAt: new Date().toISOString(),
							adminId: "admin",
						},
					};
					orders.value[localOrderIndex].status = "refund_return_shipping_approved";
					orders.value[localOrderIndex].updatedAt = new Date().toISOString();
				}
				
				orders.value = [...orders.value];
				toast.success("Đã duyệt gửi trả hàng! (API thất bại, đã lưu local)");
				return true;
			}
		}
		
		toast.error("Không thể duyệt gửi trả hàng. Vui lòng thử lại.");
		return false;
	} finally {
		isLoading.value = false;
	}
};

// Update payment status
const updatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
	try {
		isLoading.value = true;
		
		// Update via API
		const response = await axios.patch(`${ServerAxiosConfig.baseURL}/orders/${orderId}`, {
			paymentStatus: newPaymentStatus,
			updatedAt: new Date().toISOString()
		});
		
		const updatedOrder = response.data;
		
		// Update local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value[localOrderIndex] = { ...orders.value[localOrderIndex], ...updatedOrder };
		}
		
		toast.success(`Payment status updated to ${newPaymentStatus} - Đã cập nhật qua API!`);
	} catch (error) {
		console.error("Error updating payment status via API:", error);
		toast.error("Failed to update payment status");
	} finally {
		isLoading.value = false;
	}
};

// Delete order
const deleteOrder = async (orderId: string) => {
	try {
		isLoading.value = true;
		
		// Delete via API
		await axios.delete(`${ServerAxiosConfig.baseURL}/orders/${orderId}`);
		
		// Remove from local state
		const localOrderIndex = orders.value.findIndex(o => o.id === orderId);
		if (localOrderIndex !== -1) {
			orders.value.splice(localOrderIndex, 1);
		}
		
		toast.success("Order deleted successfully - Đã xóa qua API!");
	} catch (error) {
		console.error("Error deleting order via API:", error);
		toast.error("Failed to delete order");
	} finally {
		isLoading.value = false;
	}
};

// Export updated data for manual update to data.json
const exportUpdatedData = () => {
	console.log("Exporting current orders data...");
	console.log("Current orders:", orders.value);
	
	// Create a deep copy of the data to avoid reference issues
	const updatedData = {
		...data,
		orders: JSON.parse(JSON.stringify(orders.value))
	};
	
	console.log("Final exported data:", updatedData.orders);
	
	const dataStr = JSON.stringify(updatedData, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	
	const link = document.createElement('a');
	link.href = URL.createObjectURL(dataBlob);
	link.download = `updated-data-${new Date().toISOString().split('T')[0]}.json`;
	link.click();
	
	toast.success("Data exported successfully! Please replace your data.json file with this updated file.");
};

// Computed properties
const totalOrders = computed(() => orders.value.length);

// Doanh thu dự kiến (tất cả trừ cancelled)
const expectedRevenue = computed(() => 
	orders.value
		.filter(o => o.status !== "cancelled")
		.reduce((sum, o) => sum + o.total, 0)
);

// Doanh thu thực tế (chỉ delivered)
const actualRevenue = computed(() => 
	orders.value
		.filter(o => o.status === "delivered")
		.reduce((sum, o) => sum + o.total, 0)
);

// Doanh thu từ đơn hàng đã thanh toán (để tham khảo)
const totalRevenue = computed(() => 
	orders.value
		.filter(o => o.paymentStatus === "paid")
		.reduce((sum, o) => sum + o.total, 0)
);

const ordersByStatus = computed(() => {
	const grouped: Record<OrderStatus, Order[]> = {
		received: [],
		preparing: [],
		shipping: [],
		delivered: [],
		cancelled: [],
		refund_approved: [],
		refund_return_shipping: [],
		refund_return_shipping_pending: [],
		refund_return_shipping_approved: [],
		refund_return_received: [],
		refund_processing: [],
		refund_completed: [],
	};
	
	orders.value.forEach(order => {
		if (grouped[order.status as OrderStatus]) {
			grouped[order.status as OrderStatus].push(order);
		}
	});
	
	return grouped;
});

// Filter and search
const searchQuery = ref("");
const statusFilter = ref<OrderStatus | "">("");
const paymentFilter = ref<PaymentStatus | "">("");

const filteredOrders = computed(() => {
	return orders.value.filter(order => {
		const matchesSearch = searchQuery.value === "" || 
			order.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			order.userId.toString().includes(searchQuery.value);
		
		const matchesStatus = statusFilter.value === "" || order.status === statusFilter.value;
		const matchesPayment = paymentFilter.value === "" || order.paymentStatus === paymentFilter.value;
		
		return matchesSearch && matchesStatus && matchesPayment;
	});
});

// Initialize
loadOrders();

export function useOrders() {
	return {
		// State
		orders,
		isLoading,
		selectedOrder,
		showOrderModal,
		showStatusModal,
		
		// Actions
		loadOrders,
		getOrderWithDetails,
		updateOrderStatus,
		updatePaymentStatus,
		deleteOrder,
		exportUpdatedData,
		submitRefundRequest,
		processRefundRequest,
		submitReturnShippingInfo,
		confirmReturnShipmentReceived,
		processRefundPayment,
		approveReturnShipping,
		
		// Computed
		totalOrders,
		expectedRevenue,
		actualRevenue,
		totalRevenue,
		ordersByStatus,
		filteredOrders,
		
		// Filters
		searchQuery,
		statusFilter,
		paymentFilter,
	};
}
