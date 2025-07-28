<script setup lang="ts">
import { computed } from "vue";
import { useCartStore } from "@/stores/use-cart-store";
import type { CartType } from "@/types/cart";
import { toast } from "vue-sonner";

const cartStore = useCartStore();

const cartItems = computed<CartType[]>(() => cartStore.cart);
const totalPrice = computed(() =>
	cartItems.value.reduce((sum, item) => sum + (item.price ?? item.originalPrice) * item.quantity, 0)
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
	<div class="container mx-auto py-8">
		<h1 class="mb-6 text-2xl font-bold">Your Cart</h1>
		<div v-if="cartItems.length === 0" class="text-center py-20">
			<p class="text-gray-500 mb-4">Your cart is empty.</p>
			<router-link to="/shop" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
				Go Shopping
			</router-link>
		</div>
		<div v-else>
			<table class="w-full mb-8 border-collapse">
				<thead>
					<tr class="border-b">
						<th class="py-2 text-left">Product</th>
						<th class="py-2">Color</th>
						<th class="py-2">Size</th>
						<th class="py-2">Price</th>
						<th class="py-2">Quantity</th>
						<th class="py-2">Total</th>
						<th class="py-2"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in cartItems" :key="item.variantId" class="border-b">
						<td class="py-2 flex items-center gap-3">
							<img :src="item.mainImage" alt="" class="w-16 h-16 object-cover rounded" />
							<span>{{ item.name }}</span>
						</td>
						<td class="py-2">{{ item.selectedColor }}</td>
						<td class="py-2">{{ item.selectedSize }}</td>
						<td class="py-2">${{ item.price ?? item.originalPrice }}</td>
						<td class="py-2">
							<div class="flex items-center">
								<button
									class="px-2 py-1 border rounded-l"
									:disabled="item.quantity <= 1"
									@click="updateQuantity(item, item.quantity - 1)"
								>
									-
								</button>
								<span class="px-3">{{ item.quantity }}</span>
								<button
									class="px-2 py-1 border rounded-r"
									@click="updateQuantity(item, item.quantity + 1)"
								>
									+
								</button>
							</div>
						</td>
						<td class="py-2 font-semibold">${{ (item.price ?? item.originalPrice) * item.quantity }}</td>
						<td class="py-2">
							<button @click="removeItem(item)" class="text-red-500 hover:underline">Remove</button>
						</td>
					</tr>
				</tbody>
			</table>
			<div class="flex justify-between items-center">
				<div class="text-xl font-bold">Total: ${{ totalPrice }}</div>
				<button
					class="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
					@click="checkout"
				>
					Checkout
				</button>
			</div>
		</div>
	</div>
</template>