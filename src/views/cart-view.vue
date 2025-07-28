<script setup lang="ts">
import { computed } from "vue";
import { useCartStore } from "@/stores/use-cart-store";
import type { CartType } from "@/types/cart";
import { toast } from "vue-sonner";

const cartStore = useCartStore();

const cartItems = computed<CartType[]>(() => cartStore.cart);
const totalPrice = computed(() =>
	cartItems.value.reduce(
		(sum, item) => sum + (item.price ?? item.originalPrice) * item.quantity,
		0,
	),
);

const updateQuantity = (item: CartType, qty: number) => {
	if (qty < 1) return;
	cartStore.updateQuantity(item, qty);
};

const removeItem = (item: CartType) => {
	cartStore.removeFromCart(item);
	toast.success(`Removed ${item.name} from cart`);
};

const checkout = () => {
	toast.success("Checkout not implemented yet!");
};
</script>

<template>
	<div class="cart-container">
		<h1 class="cart-title">Your Cart</h1>
		<div v-if="cartItems.length === 0" class="cart-empty">
			<p class="cart-empty-text">Your cart is empty.</p>
			<router-link
				to="/shop"
				class="cart-shop-btn"
			>
				Go Shopping
			</router-link>
		</div>
		<div v-else>
			<table class="cart-table">
				<thead>
					<tr>
						<th class="cart-th">Product</th>
						<th class="cart-th">Color</th>
						<th class="cart-th">Size</th>
						<th class="cart-th">Price</th>
						<th class="cart-th">Quantity</th>
						<th class="cart-th">Total</th>
						<th class="cart-th"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in cartItems" :key="item.variantId" class="cart-tr">
						<td class="cart-product">
							<img :src="item.mainImage" alt="" class="cart-img" />
							<span>{{ item.name }}</span>
						</td>
						<td class="cart-td">{{ item.selectedColor }}</td>
						<td class="cart-td">{{ item.selectedSize }}</td>
						<td class="cart-td">${{ item.price ?? item.originalPrice }}</td>
						<td class="cart-td">
							<div class="cart-qty">
								<button
									class="cart-qty-btn cart-qty-btn-left"
									:disabled="item.quantity <= 1"
									@click="updateQuantity(item, item.quantity - 1)"
								>
									-
								</button>
								<span class="cart-qty-num">{{ item.quantity }}</span>
								<button
									class="cart-qty-btn cart-qty-btn-right"
									@click="updateQuantity(item, item.quantity + 1)"
								>
									+
								</button>
							</div>
						</td>
						<td class="cart-total">
							${{ (item.price ?? item.originalPrice) * item.quantity }}
						</td>
						<td class="cart-td">
							<button @click="removeItem(item)" class="cart-remove-btn">Remove</button>
						</td>
					</tr>
				</tbody>
			</table>
			<div class="cart-summary">
				<div class="cart-summary-total">Total: ${{ totalPrice }}</div>
				<button
					class="cart-checkout-btn"
					@click="checkout"
				>
					Checkout
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.cart-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem 0;
}
.cart-title {
	margin-bottom: 1.5rem;
	font-size: 2rem;
	font-weight: bold;
}
.cart-empty {
	padding: 5rem 0;
	text-align: center;
}
.cart-empty-text {
	margin-bottom: 1rem;
	color: #6b7280;
}
.cart-shop-btn {
	display: inline-block;
	border-radius: 0.375rem;
	background: #000;
	padding: 0.5rem 1.5rem;
	color: #fff;
	transition: background 0.2s;
	text-decoration: none;
}
.cart-shop-btn:hover {
	background: #1f2937;
}
.cart-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 2rem;
}
.cart-th {
	padding: 0.5rem 0;
	text-align: left;
	border-bottom: 1px solid #e5e7eb;
}
.cart-tr {
	border-bottom: 1px solid #e5e7eb;
}
.cart-product {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.5rem 0;
}
.cart-img {
	height: 4rem;
	width: 4rem;
	border-radius: 0.5rem;
	object-fit: cover;
}
.cart-td {
	padding: 0.5rem 0;
}
.cart-qty {
	display: flex;
	align-items: center;
}
.cart-qty-btn {
	border: 1px solid #d1d5db;
	padding: 0.25rem 0.5rem;
	background: #fff;
	cursor: pointer;
}
.cart-qty-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.cart-qty-btn-left {
	border-radius: 0.375rem 0 0 0.375rem;
}
.cart-qty-btn-right {
	border-radius: 0 0.375rem 0.375rem 0;
}
.cart-qty-num {
	padding: 0 0.75rem;
}
.cart-total {
	padding: 0.5rem 0;
	font-weight: 600;
}
.cart-remove-btn {
	color: #ef4444;
	background: none;
	border: none;
	cursor: pointer;
	text-decoration: underline;
}
.cart-remove-btn:hover {
	text-decoration: none;
}
.cart-summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.cart-summary-total {
	font-size: 1.25rem;
	font-weight: bold;
}
.cart-checkout-btn {
	border-radius: 0.375rem;
	background: #000;
	padding: 0.75rem 1.5rem;
	color: #fff;
	transition: background 0.2s;
	border: none;
	cursor: pointer;
}
.cart-checkout-btn:hover {
	background: #1f2937;
}
</style>
