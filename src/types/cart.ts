import type { Product } from "./products";

interface variant {
	selectedColor?: string;
	selectedSize?: string;
	selectedColorCode?: string;
	variantId?: number;
	variantSku?: string;
	price?: number;
}

export type CartType = Product &
	variant & {
		quantity: number;
	};
