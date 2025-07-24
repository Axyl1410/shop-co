import type { Product } from "./products";

export type CartType = Product & {
	quantity: number;
};
