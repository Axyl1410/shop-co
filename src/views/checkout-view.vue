<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { useBillStore } from "@/stores/use-bill-store";
import { useCartStore } from "@/stores/use-cart-store";
import axios from "axios";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const billStore = useBillStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { getTotalPrice, cart } = cartStore;
const { getBank } = billStore;
const { user } = storeToRefs(authStore);

// Form data
const formData = ref({
	fullName: "",
	phone: "",
	address: "",
	city: "",
	state: "",
	zipCode: "",
	country: "Vietnam",
	notes: "",
});

const isLoading = ref(false);
const activeTab = ref("cash");

// Computed values
const subtotal = computed(() => getTotalPrice * 26000);
const tax = computed(() => subtotal.value * 0.1); // 10% tax
const shipping = computed(() => 50000); // 50,000 VND shipping
const total = computed(() => subtotal.value + tax.value + shipping.value);

// Handle form submission
const handleSubmit = async () => {
	if (!formData.value.fullName || !formData.value.phone || !formData.value.address) {
		alert("Vui lòng điền đầy đủ thông tin giao hàng");
		return;
	}

	isLoading.value = true;

	try {
		const orderData = {
			orderNumber: `ORD-${Date.now()}`,
			userId: user.value?.id || 0,
			status: "pending",
			subtotal: subtotal.value,
			tax: tax.value,
			shipping: shipping.value,
			discount: 0,
			total: total.value,
			currency: "VND",
			shippingAddressId: 1,
			billingAddressId: 1,
			paymentMethod: activeTab.value === "cash" ? "cash_on_delivery" : "bank_transfer",
			paymentStatus: "pending",
			notes: formData.value.notes,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Create order items
		const orderItems = cart.map((item) => ({
			productVariantId: item.variantId || item.id,
			productName: item.name,
			productSku: item.variantSku || item.sku,
			size: item.selectedSize || "M",
			color: item.selectedColor || "Default",
			quantity: item.quantity,
			unitPrice: item.price || 0,
			totalPrice: (item.price || 0) * item.quantity,
		}));

		// Create complete order payload
		const orderPayload = {
			order: orderData,
			orderItems: orderItems,

			shippingAddress: {
				fullName: formData.value.fullName,
				phone: formData.value.phone,
				address: formData.value.address,
				city: formData.value.city,
				state: formData.value.state,
				zipCode: formData.value.zipCode,
				country: formData.value.country,
			},
		};

		// POST to localhost:3000/orders
		const response = await axios.post("http://localhost:3000/orders", orderPayload);

		console.log("Order created successfully:", response.data);
		alert("Đặt hàng thành công!");

		// Clear cart after successful order
		cartStore.clearCart();

		// Reset form
		formData.value = {
			fullName: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			zipCode: "",
			country: "Vietnam",
			notes: "",
		};
	} catch (error) {
		console.error("Error creating order:", error);
		alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
	} finally {
		isLoading.value = false;
	}
};
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="container mx-auto max-w-6xl px-4">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900">Thanh toán</h1>
				<p class="mt-2 text-gray-600">Hoàn tất đơn hàng của bạn</p>
			</div>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<!-- Left Column - Order Summary -->
				<div class="space-y-6 lg:col-span-2">
					<!-- Shipping Information -->
					<Card>
						<CardHeader>
							<CardTitle>Thông tin giao hàng</CardTitle>
							<CardDescription>Nhập thông tin để giao hàng</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<Label for="fullName">Họ và tên *</Label>
									<Input
										id="fullName"
										v-model="formData.fullName"
										placeholder="Nhập họ và tên"
										required
									/>
								</div>
								<div class="space-y-2">
									<Label for="phone">Số điện thoại *</Label>
									<Input
										id="phone"
										v-model="formData.phone"
										placeholder="Nhập số điện thoại"
										required
									/>
								</div>
							</div>
							<div class="space-y-2">
								<Label for="address">Địa chỉ *</Label>
								<Input
									id="address"
									v-model="formData.address"
									placeholder="Nhập địa chỉ chi tiết"
									required
								/>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-2">
									<Label for="city">Thành phố</Label>
									<Input id="city" v-model="formData.city" placeholder="Thành phố" />
								</div>
								<div class="space-y-2">
									<Label for="state">Tỉnh/Thành</Label>
									<Input id="state" v-model="formData.state" placeholder="Tỉnh/Thành" />
								</div>
								<div class="space-y-2">
									<Label for="zipCode">Mã bưu điện</Label>
									<Input id="zipCode" v-model="formData.zipCode" placeholder="Mã bưu điện" />
								</div>
							</div>
							<div class="space-y-2">
								<Label for="notes">Ghi chú</Label>
								<Input
									id="notes"
									v-model="formData.notes"
									placeholder="Ghi chú cho đơn hàng (tùy chọn)"
								/>
							</div>
						</CardContent>
					</Card>

					<!-- Payment Method -->
					<Card>
						<CardHeader>
							<CardTitle>Phương thức thanh toán</CardTitle>
							<CardDescription>Chọn cách bạn muốn thanh toán</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs v-model="activeTab" class="w-full">
								<TabsList class="grid w-full grid-cols-2">
									<TabsTrigger value="cash">Tiền mặt</TabsTrigger>
									<TabsTrigger value="bank">Chuyển khoản</TabsTrigger>
								</TabsList>

								<TabsContent value="cash" class="mt-4">
									<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
										<p class="text-sm text-blue-800">
											Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đủ tiền để
											thanh toán.
										</p>
									</div>
								</TabsContent>

								<TabsContent value="bank" class="mt-4">
									<div class="space-y-4">
										<div class="rounded-lg border border-green-200 bg-green-50 p-4">
											<p class="mb-3 text-sm text-green-800">Chuyển khoản ngân hàng VPBank</p>
											<div class="space-y-2 text-sm">
												<div class="flex justify-between">
													<span class="font-medium">Ngân hàng:</span>
													<span>VPBank</span>
												</div>
												<div class="flex justify-between">
													<span class="font-medium">Số tài khoản:</span>
													<span>{{ billStore.ACCOUNT_NO }}</span>
												</div>
												<div class="flex justify-between">
													<span class="font-medium">Chủ tài khoản:</span>
													<span>{{ billStore.bankOwner }}</span>
												</div>
												<div class="flex justify-between">
													<span class="font-medium">Số tiền:</span>
													<span class="font-bold text-green-700"
														>{{ total.toLocaleString("vi-VN") }} VND</span
													>
												</div>
											</div>
										</div>

										<!-- QR Code -->
										<div class="text-center">
											<p class="mb-2 text-sm text-gray-600">Quét mã QR để thanh toán</p>
											<img
												:src="
													getBank({ total: total, content: `Thanh toan don hang ${Date.now()}` })
												"
												alt="QR Code thanh toán"
												class="mx-auto w-full rounded-lg border"
											/>
										</div>
									</div>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>

				<!-- Right Column - Order Summary -->
				<div class="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Tóm tắt đơn hàng</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<!-- Cart Items -->
							<div class="space-y-3">
								<div v-for="item in cart" :key="item.id" class="flex items-center space-x-3">
									<img
										:src="`/src/assets${item.mainImage}`"
										:alt="item.name"
										class="h-12 w-12 rounded-md object-cover"
									/>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium text-gray-900">{{ item.name }}</p>
										<p class="text-xs text-gray-500">
											{{ item.selectedSize || "M" }} - {{ item.selectedColor || "Default" }}
										</p>
									</div>
									<div class="text-right">
										<p class="text-sm font-medium text-gray-900">
											{{ ((item.price || 0) * item.quantity * 26000).toLocaleString("vi-VN") }} VND
										</p>
										<p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
									</div>
								</div>
							</div>

							<Separator />

							<!-- Price Breakdown -->
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span>Tạm tính:</span>
									<span>{{ subtotal.toLocaleString("vi-VN") }} VND</span>
								</div>
								<div class="flex justify-between text-sm">
									<span>Thuế (10%):</span>
									<span>{{ tax.toLocaleString("vi-VN") }} VND</span>
								</div>
								<div class="flex justify-between text-sm">
									<span>Phí vận chuyển:</span>
									<span>{{ shipping.toLocaleString("vi-VN") }} VND</span>
								</div>
								<Separator />
								<div class="flex justify-between text-lg font-bold">
									<span>Tổng cộng:</span>
									<span class="text-green-600">{{ total.toLocaleString("vi-VN") }} VND</span>
								</div>
							</div>

							<!-- Payment Button -->
							<Button
								@click="handleSubmit"
								:disabled="isLoading || cart.length === 0"
								class="h-12 w-full text-lg font-semibold"
								:class="{
									'bg-green-600 hover:bg-green-700': activeTab === 'bank',
									'bg-blue-600 hover:bg-blue-700': activeTab === 'cash',
								}"
							>
								<span v-if="isLoading">Đang xử lý...</span>
								<span v-else>
									{{ activeTab === "cash" ? "Đặt hàng" : "Thanh toán ngay" }}
								</span>
							</Button>

							<p class="text-center text-xs text-gray-500">
								Bằng cách nhấn nút trên, bạn đồng ý với
								<a href="#" class="text-blue-600 hover:underline">điều khoản sử dụng</a>
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>
