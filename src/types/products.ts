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
	basePrice: number;
	salePrice: number;
	costPrice: number;
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
}
