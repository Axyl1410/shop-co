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
			return cart.value.reduce(
				(total, item) => total + item.quantity * calculatePrice(item).finalPrice,
				0,
			);
		});

		const addToCart = (product: Product, quantity: number) => {
			const existingProduct = cart.value.find((item) => item.id === product.id);
			if (existingProduct) {
				existingProduct.quantity += quantity;
			} else {
				cart.value.push({ ...product, quantity });
			}
		};

		const removeFromCart = (product: Product, quantity: number) => {
			const existingProduct = cart.value.find((item) => item.id === product.id);
			if (existingProduct) {
				existingProduct.quantity -= quantity;
				if (existingProduct.quantity <= 0) {
					cart.value = cart.value.filter((item) => item.id !== product.id);
				}
			}
		};

		const clearItemFromCart = (product: Product) => {
			const existingProduct = cart.value.find((item) => item.id === product.id);
			if (existingProduct) {
				cart.value = cart.value.filter((item) => item.id !== product.id);
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
			removeFromCart,
			clearItemFromCart,
			clearCart,
		};
	},
	{ persist: true },
);
