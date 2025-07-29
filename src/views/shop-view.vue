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
import { Sliders } from "lucide-vue-next";

const { products } = useProducts();
</script>

<template>
	<Separator class="container mx-auto" />
	<div class="container mx-auto my-4 flex flex-col gap-8 px-4">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/"> Home </BreadcrumbLink>
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
						<h1 class="text-2xl font-bold md:text-[32px]">Casual</h1>
						<div class="flex flex-col lg:flex-row">
							<p class="mr-3 text-sm text-black/60 md:text-base">Showing 1-10 of 100 Products</p>
							<div className="flex items-center">
								<p>Sort by:</p>
								<Select defaultValue="most-popular">
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
				<div class="sm:grid-col-2 mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					<ProductCard v-for="item in products" :data="item" :key="item.id" />
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
