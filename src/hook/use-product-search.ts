import type { Product } from "@/types/products";
import { computed, ref, type Ref } from "vue";

export function useProductSearch(products: Ref<Product[] | undefined>) {
	const searchQuery = ref("");

	// Normalize string for search (remove accents, lowercase)
	const normalizeString = (str: string): string => {
		return str
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.trim();
	};

	// Search products based on multiple criteria
	const searchedProducts = computed(() => {
		if (!products.value || !searchQuery.value.trim()) {
			return products.value || [];
		}

		const query = normalizeString(searchQuery.value);
		const queryWords = query.split(/\s+/).filter(Boolean);

		return products.value.filter((product) => {
			// Search in product name
			const nameMatch = normalizeString(product.name).includes(query);

			// Search in product description
			const descriptionMatch = normalizeString(product.description).includes(query);

			// Search in short description
			const shortDescMatch = normalizeString(product.shortDescription).includes(query);

			// Search in brand
			const brandMatch = normalizeString(product.brand).includes(query);

			// Search in tags
			const tagsMatch = product.tags.some((tag) => normalizeString(tag).includes(query));

			// Search in SKU
			const skuMatch = normalizeString(product.sku).includes(query);

			// Check if all query words match in any field (for multi-word searches)
			const allWordsMatch = queryWords.every((word) => {
				const productText = [
					product.name,
					product.description,
					product.shortDescription,
					product.brand,
					...product.tags,
					product.sku,
				].join(" ");

				return normalizeString(productText).includes(word);
			});

			// Return true if any single criterion matches OR all words match
			return nameMatch || descriptionMatch || shortDescMatch || brandMatch || tagsMatch || skuMatch || allWordsMatch;
		});
	});

	// Get search suggestions based on current products
	const getSearchSuggestions = computed(() => {
		if (!products.value) return [];

		const suggestions = new Set<string>();

		products.value.forEach((product) => {
			// Add brand suggestions
			suggestions.add(product.brand);

			// Add tag suggestions
			product.tags.forEach((tag) => suggestions.add(tag));

			// Add name words (for partial matching)
			const nameWords = product.name.split(/\s+/).filter((word) => word.length > 2);
			nameWords.forEach((word) => suggestions.add(word));
		});

		return Array.from(suggestions).sort();
	});

	// Clear search
	const clearSearch = () => {
		searchQuery.value = "";
	};

	// Set search query
	const setSearchQuery = (query: string) => {
		searchQuery.value = query;
	};

	return {
		searchQuery,
		searchedProducts,
		getSearchSuggestions,
		clearSearch,
		setSearchQuery,
	};
}