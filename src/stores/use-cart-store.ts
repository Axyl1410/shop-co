import { calculatePrice } from "@/lib/utils";
import type { CartType } from "@/types";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCartStore = defineStore(
	"cart",
	() => {
		const cart = ref<CartType[]>([]);

		const getCart = computed(() => cart.value);

		const getTotalItems = computed(() => {
			return cart.value.reduce((total, item) => total + item.quantity, 0);
		});

		const getTotalPrice = computed(() => {
			return cart.value.reduce((total, item) => {
				const price = item.price || calculatePrice(item).finalPrice;
				return total + item.quantity * price;
			}, 0);
		});

		const addToCart = (product: CartType, quantity: number) => {
			const productKey = product.variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				existingProduct.quantity += quantity;
			} else {
				cart.value.push({ ...product, quantity });
			}
		};

		const updateQuantity = (product: CartType, quantity: number) => {
			const productKey = product.variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				if (quantity <= 0) {
					cart.value = cart.value.filter((item) => (item.variantId || item.id) !== productKey);
				} else {
					existingProduct.quantity = quantity;
				}
			}
		};

		const removeFromCart = (product: CartType, quantity: number) => {
			const productKey = product.variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				existingProduct.quantity -= quantity;
				if (existingProduct.quantity <= 0) {
					cart.value = cart.value.filter((item) => (item.variantId || item.id) !== productKey);
				}
			}
		};

		const clearItemFromCart = (product: CartType) => {
			const productKey = product.variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				cart.value = cart.value.filter((item) => (item.variantId || item.id) !== productKey);
			}
		};

		const clearCart = () => {
			cart.value = [];
		};

		return {
			cart,

			getCart,
			getTotalItems,
			getTotalPrice,

			addToCart,
			updateQuantity,
			removeFromCart,
			clearItemFromCart,
			clearCart,
		};
	},
	{ persist: true },
);
