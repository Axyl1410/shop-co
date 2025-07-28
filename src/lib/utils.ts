import type { Product } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

export const calculatePrice = (product: Product) => {
	const originalPrice = product.originalPrice;
	const discountPercentage = product.discountPercentage;
	const finalPrice = originalPrice * (1 - discountPercentage / 100);

	return {
		finalPrice: Math.round(finalPrice),
		originalPrice: originalPrice,
		discountPercentage,
		hasDiscount: discountPercentage > 0,
	};
};
