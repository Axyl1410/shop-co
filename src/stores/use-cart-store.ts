import { calculatePrice } from "@/lib/utils";
import type { CartType, Product } from "@/types";
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
				const price = item.price
					? calculatePrice(item).finalPrice + item.price
					: calculatePrice(item).finalPrice;
				return total + item.quantity * price;
			}, 0);
		});

		const addToCart = (product: Product | CartType, quantity: number) => {
			const productKey = (product as CartType).variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				existingProduct.quantity += quantity;
			} else {
				cart.value.push({ ...product, quantity });
			}
		};

		const updateQuantity = (product: Product | CartType, quantity: number) => {
			const productKey = (product as CartType).variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				if (quantity <= 0) {
					cart.value = cart.value.filter((item) => (item.variantId || item.id) !== productKey);
				} else {
					existingProduct.quantity = quantity;
				}
			}
		};

		const removeFromCart = (product: Product | CartType, quantity: number) => {
			const productKey = (product as CartType).variantId || product.id;
			const existingProduct = cart.value.find((item) => (item.variantId || item.id) === productKey);

			if (existingProduct) {
				existingProduct.quantity -= quantity;
				if (existingProduct.quantity <= 0) {
					cart.value = cart.value.filter((item) => (item.variantId || item.id) !== productKey);
				}
			}
		};

		const clearItemFromCart = (product: Product | CartType) => {
			const productKey = (product as CartType).variantId || product.id;
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
