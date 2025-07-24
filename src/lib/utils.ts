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
	const basePrice = product.basePrice;
	const salePrice = product.salePrice;
	const discount = basePrice - salePrice;
	const discountPercentage = discount > 0 ? Math.round((discount / basePrice) * 100) : 0;

	return {
		finalPrice: salePrice,
		originalPrice: basePrice,
		discountPercentage,
		hasDiscount: discount > 0,
	};
};
