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
import SearchInput from "@/components/ui/search-input.vue";
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
import { useProductSearch } from "@/hook/use-product-search";
import { calculatePrice } from "@/lib/utils";
import type { Category } from "@/types/category";
import { Sliders } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const { products } = useProducts();
const { categories } = useCategories();
const route = useRoute();
const router = useRouter();

// Search functionality
const { searchQuery, searchedProducts, clearSearch } = useProductSearch(products);

const sortParam = computed(() => (route.query.sort as string) || "most-popular");
const sort = ref(sortParam.value);
watch(sort, (val) => {
	router.replace({ query: { ...route.query, sort: val } });
});

// URL parameters
const searchParam = computed(() => (route.query.search as string) || "");
const categoryParam = computed(() => route.query.category as string | undefined);
const minPriceParam = computed(() => {
	const v = Number(route.query.minPrice);
	return Number.isFinite(v) && v >= 0 ? v : undefined;
});
const maxPriceParam = computed(() => {
	const v = Number(route.query.maxPrice);
	return Number.isFinite(v) && v >= 0 ? v : undefined;
});

// Initialize search from URL
searchQuery.value = searchParam.value;

// Watch for search query changes and update URL
watch(searchQuery, (newValue) => {
	const query = { ...route.query };
	if (newValue.trim()) {
		query.search = newValue;
	} else {
		delete query.search;
	}
	router.replace({ query });
});

// Watch for URL search param changes
watch(searchParam, (newValue) => {
	if (newValue !== searchQuery.value) {
		searchQuery.value = newValue;
	}
});

const categorySlugToId = computed(() => {
	const map = new Map<string, number>();
	(categories?.value || []).forEach((c: Category) => {
		// category id from API may be string → coerce to number
		map.set(c.slug, Number(c.id));
	});
	return map;
});

const filteredProducts = computed(() => {
	// Start with searched products instead of all products
	const list = searchedProducts.value ? [...searchedProducts.value] : [];

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
		<!-- Search Section -->
		<div class="mb-6">
			<div class="mx-auto max-w-2xl">
				<SearchInput
					v-model="searchQuery"
					placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu, mô tả..."
					@clear="clearSearch"
				/>
			</div>
			<div v-if="searchQuery.trim()" class="mt-2 text-center text-sm text-gray-600">
				Đang tìm kiếm: <span class="font-medium">"{{ searchQuery }}"</span>
				<button @click="clearSearch" class="ml-2 text-blue-600 hover:text-blue-800">
					Xóa tìm kiếm
				</button>
			</div>
		</div>

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
						<h1 class="text-2xl font-bold md:text-[32px]">
							<span v-if="searchQuery.trim()"> Kết quả tìm kiếm </span>
							<span v-else>
								{{ route.query.category || "Casual" }}
							</span>
						</h1>
						<div class="flex flex-col lg:flex-row">
							<p class="mr-3 text-sm text-black/60 md:text-base">
								<span v-if="searchQuery.trim()">
									Tìm thấy {{ filteredProducts.length }} sản phẩm
								</span>
								<span v-else>
									Showing {{ filteredProducts.length }} of {{ totalProductsCount }} Products
								</span>
							</p>
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
					v-if="filteredProducts.length > 0"
					class="sm:grid-col-2 mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
				>
					<ProductCard v-for="item in filteredProducts" :data="item" :key="item.id" />
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
							<h3 class="mt-4 text-lg font-medium text-gray-900">
								<span v-if="searchQuery.trim()"> Không tìm thấy sản phẩm nào </span>
								<span v-else> Không có sản phẩm nào </span>
							</h3>
							<p class="mt-2 text-sm text-gray-500">
								<span v-if="searchQuery.trim()">
									Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
								</span>
								<span v-else> Thử thay đổi bộ lọc hoặc quay lại sau. </span>
							</p>
							<div v-if="searchQuery.trim()" class="mt-4">
								<button
									@click="clearSearch"
									class="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
								>
									Xóa tìm kiếm
								</button>
							</div>
						</div>
					</div>
				</div>
				<hr className="border-t-black/10 my-8" />
				<Pagination v-slot="{ page }" :items-per-page="10" :total="30" :default-page="2">
					<PaginationContent v-slot="{ items }">
						<PaginationPrevious />

						<template v-for="(item, index) in items" :key="index">
							<PaginationItem
								v-if="item.type === 'page'"
								:value="item.value"
								:is-active="item.value === page"
							>
								{{ item.value }}
							</PaginationItem>
						</template>

						<PaginationEllipsis :index="4" />

						<PaginationNext />
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	</div>
</template>
