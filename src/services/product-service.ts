import type { Product, ProductVariant } from "@/types";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export class ProductService {
	// Get all products
	static async getAllProducts(): Promise<Product[]> {
		const response = await axios.get(`${API_BASE_URL}/products`);
		return response.data;
	}

	// Get product by ID
	static async getProductById(id: number): Promise<Product> {
		const response = await axios.get(`${API_BASE_URL}/products/${id}`);
		return response.data;
	}

	// Create new product
	static async createProduct(
		product: Omit<Product, "id" | "createdAt" | "updatedAt">,
	): Promise<Product> {
		const response = await axios.post(`${API_BASE_URL}/products`, {
			...product,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		return response.data;
	}

	// Update product
	static async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
		const response = await axios.patch(`${API_BASE_URL}/products/${id}`, {
			...product,
			updatedAt: new Date().toISOString(),
		});
		return response.data;
	}

	// Soft delete product (set isActive to false)
	static async deleteProduct(id: number): Promise<Product> {
		const response = await axios.patch(`${API_BASE_URL}/products/${id}`, {
			isActive: false,
			updatedAt: new Date().toISOString(),
		});
		return response.data;
	}

	// Activate product (set isActive to true)
	static async activateProduct(id: number): Promise<Product> {
		const response = await axios.patch(`${API_BASE_URL}/products/${id}`, {
			isActive: true,
			updatedAt: new Date().toISOString(),
		});
		return response.data;
	}

	// Get product variants
	static async getProductVariants(productId: number): Promise<ProductVariant[]> {
		const response = await axios.get(`${API_BASE_URL}/product_variants?productId=${productId}`);
		return response.data;
	}

	// Create product variant
	static async createProductVariant(variant: Omit<ProductVariant, "id">): Promise<ProductVariant> {
		const response = await axios.post(`${API_BASE_URL}/product_variants`, variant);
		return response.data;
	}

	// Update product variant
	static async updateProductVariant(
		id: number,
		variant: Partial<ProductVariant>,
	): Promise<ProductVariant> {
		const response = await axios.patch(`${API_BASE_URL}/product_variants/${id}`, variant);
		return response.data;
	}

	// Delete product variant
	static async deleteProductVariant(id: number): Promise<void> {
		await axios.delete(`${API_BASE_URL}/product_variants/${id}`);
	}
}
