<script setup lang="ts">
import FilterPanel from "@/components/layout/filter-panel.vue";
import MobileFilters from "@/components/layout/filters/mobile-filters.vue";
import ProductCard from "@/components/section/home/product-card.vue";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hook";
import { useCategories } from "@/hook/use-categories";
import { calculatePrice } from "@/lib/utils";
import type { Category } from "@/types/category";
import { Sliders } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const { products } = useProducts();
const { categories } = useCategories();
const route = useRoute();
const router = useRouter();

// Search removed: keep UI only in template

const sortParam = computed(() => (route.query.sort as string) || "most-popular");
const sort = ref(sortParam.value);
watch(sort, (val) => {
	router.replace({ query: { ...route.query, sort: val } });
});

// URL parameters
const categoryParam = computed(() => route.query.category as string | undefined);
const minPriceParam = computed(() => {
	const v = Number(route.query.minPrice);
	return Number.isFinite(v) && v >= 0 ? v : undefined;
});
const maxPriceParam = computed(() => {
	const v = Number(route.query.maxPrice);
	return Number.isFinite(v) && v >= 0 ? v : undefined;
});

// Temporary price filter state (before applying)
const tempMinPrice = ref(minPriceParam.value || 0);
const tempMaxPrice = ref(maxPriceParam.value || 150);

// Apply filter function
const applyPriceFilter = () => {
	const query = { ...route.query };
	
	if (tempMinPrice.value > 0) {
		query.minPrice = tempMinPrice.value.toString();
	} else {
		delete query.minPrice;
	}
	
	if (tempMaxPrice.value < 150) {
		query.maxPrice = tempMaxPrice.value.toString();
	} else {
		delete query.maxPrice;
	}
	
	// Reset to page 1 when applying filter
	delete query.page;
	router.replace({ query });
};

// No search syncing

const categorySlugToId = computed(() => {
	const map = new Map<string, number>();
	(categories?.value || []).forEach((c: Category) => {
		// category id from API may be string → coerce to number
		map.set(c.slug, Number(c.id));
	});
	return map;
});

const filteredProducts = computed(() => {
	// Start from all products; ignore keyword searching
	const list = products.value ? [...products.value] : [];

	// category filter
	let filtered = list;
	if (categoryParam.value) {
		const catId = categorySlugToId.value.get(categoryParam.value);
		if (catId != null) {
			filtered = filtered.filter((p) => Number(p.categoryId) === Number(catId));
		} else {
			filtered = [];
		}
	}

	// price filter
	filtered = filtered.filter((p) => {
		const price = calculatePrice(p).finalPrice;
		if (minPriceParam.value != null && price < minPriceParam.value) return false;
		if (maxPriceParam.value != null && price > maxPriceParam.value) return false;
		return true;
	});

	// sorting
	const sortKey = sortParam.value;
	if (sortKey === "low-price") {
		filtered.sort((a, b) => calculatePrice(a).finalPrice - calculatePrice(b).finalPrice);
	} else if (sortKey === "high-price") {
		filtered.sort((a, b) => calculatePrice(b).finalPrice - calculatePrice(a).finalPrice);
	} else {
		// most-popular → viewCount desc
		filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
	}

	return filtered;
});

const totalProductsCount = computed(() => (products.value ? products.value.length : 0));

// Pagination logic
const itemsPerPage = 5; // 5 sản phẩm mỗi trang

// Get current page from URL or default to 1
const pageParam = computed(() => {
	const page = Number(route.query.page);
	return Number.isFinite(page) && page > 0 ? page : 1;
});

const currentPage = ref(pageParam.value);

// Watch for URL changes and update current page
watch(pageParam, (newPage) => {
	if (newPage !== currentPage.value) {
		currentPage.value = newPage;
	}
});

// Watch for current page changes and update URL
watch(currentPage, (newPage) => {
	const query = { ...route.query };
	if (newPage > 1) {
		query.page = newPage.toString();
	} else {
		delete query.page;
	}
	router.replace({ query });
});

// Watch for URL price changes and update temp values
watch([minPriceParam, maxPriceParam], ([newMin, newMax]) => {
	tempMinPrice.value = newMin || 0;
	tempMaxPrice.value = newMax || 150;
});

const totalPages = computed(() => {
	const pages = Math.ceil(filteredProducts.value.length / itemsPerPage);
	console.log(`Total products: ${filteredProducts.value.length}, Items per page: ${itemsPerPage}, Total pages: ${pages}`);
	return pages;
});

const paginatedProducts = computed(() => {
	const startIndex = (currentPage.value - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	return filteredProducts.value.slice(startIndex, endIndex);
});

const visiblePages = computed(() => {
	const pages = [];
	const maxVisible = 3;
	
	if (totalPages.value <= maxVisible) {
		for (let i = 1; i <= totalPages.value; i++) {
			pages.push(i);
		}
	} else {
		if (currentPage.value <= 2) {
			pages.push(1, 2, 3);
		} else if (currentPage.value >= totalPages.value - 1) {
			pages.push(totalPages.value - 2, totalPages.value - 1, totalPages.value);
		} else {
			pages.push(currentPage.value - 1, currentPage.value, currentPage.value + 1);
		}
	}
	
	return pages;
});

const showEllipsis = computed(() => {
	return totalPages.value > 3 && (currentPage.value > 2 || currentPage.value < totalPages.value - 1);
});

// Expose for filter panel
defineExpose({
	tempMinPrice,
	tempMaxPrice,
	applyPriceFilter,
});
</script>

<template>
	<Separator class="container mx-auto" />
	<div class="container mx-auto my-4 flex flex-col gap-8 px-4">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink as-child>
						<RouterLink to="/">Home</RouterLink>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Shop</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="flex gap-8">
			<div
				class="hidden max-w-[295px] min-w-[295px] space-y-5 rounded-[20px] border border-black/10 px-5 py-5 md:block md:space-y-6 md:px-6"
			>
				<div class="flex max-w-[295px] items-center justify-between">
					<span class="text-xl font-bold text-black">Filters</span>
					<Sliders class="text-2xl text-black/40" />
				</div>
				<FilterPanel />
			</div>
			<div class="flex flex-1 flex-col">
				<div class="flex items-center justify-between">
					<div class="flex w-full flex-col justify-between sm:flex-row sm:items-center">
						<h1 class="text-2xl font-bold md:text-[32px]">{{ route.query.category || "Casual" }}</h1>
						<div class="flex flex-col lg:flex-row">
							<p class="mr-3 text-sm text-black/60 md:text-base">Showing {{ filteredProducts.length }} of {{ totalProductsCount }} Products</p>
							<div className="flex items-center">
								<p>Sort by:</p>
								<Select v-model="sort">
									<div class="flex items-center">
										<SelectTrigger
											className="font-medium flex items-center text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="most-popular">Most Popular</SelectItem>
											<SelectItem value="low-price">Low Price</SelectItem>
											<SelectItem value="high-price">High Price</SelectItem>
										</SelectContent>
									</div>
								</Select>
							</div>
						</div>
					</div>
					<div class="flex items-center md:hidden">
						<MobileFilters />
					</div>
				</div>
				<div
					v-if="paginatedProducts.length > 0"
					class="sm:grid-col-2 mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
				>
					<ProductCard v-for="item in paginatedProducts" :data="item" :key="item.id" />
				</div>

				<!-- No results message -->
				<div v-else class="mt-8 text-center">
					<div class="mx-auto max-w-md">
						<div class="rounded-lg bg-gray-50 p-8">
							<svg
								class="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<h3 class="mt-4 text-lg font-medium text-gray-900">Không có sản phẩm nào</h3>
							<p class="mt-2 text-sm text-gray-500">
								Thử thay đổi bộ lọc hoặc quay lại sau.
							</p>
						</div>
					</div>
				</div>
				<hr className="border-t-black/10 my-8" />
				
				<!-- Custom Pagination -->
				<div class="flex items-center justify-center gap-2 mt-8">
					<button 
						class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
						:disabled="currentPage === 1"
						@click="currentPage > 1 && (currentPage--)"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
						Previous
					</button>
					
					<button 
						v-for="page in visiblePages" 
						:key="page"
						class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
						:class="page === currentPage 
							? 'bg-black text-white' 
							: 'text-gray-600 hover:text-black hover:bg-gray-100'"
						@click="currentPage = page"
					>
						{{ page }}
					</button>
					
					<span v-if="showEllipsis" class="px-2 text-gray-400">...</span>
					
					<button 
						class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
						:disabled="currentPage === totalPages"
						@click="currentPage < totalPages && (currentPage++)"
					>
						Next
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
