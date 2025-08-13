export interface Dimensions {
	length: number;
	width: number;
	height: number;
}

export interface Product {
	id: number;
	name: string;
	slug: string;
	description: string;
	shortDescription: string;
	categoryId: number;
	brand: string;
	sku: string;
	originalPrice: number;
	discountPercentage: number;
	weight: number;
	dimensions: Dimensions;
	images: string[];
	mainImage: string;
	tags: string[];
	isActive: boolean;
	isFeatured: boolean;
	isNew: boolean;
	rating: number;
	reviewCount: number;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	variants?: ProductVariant[];
}

export interface ProductVariant {
	id: number;
	name: string;
	productId: number;
	size: string;
	color: string;
	colorCode: string;
	sku: string;
	salePrice: number;
	stockQuantity: number;
}
