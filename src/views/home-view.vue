<script setup lang="ts">
import Brands from "@/components/section/home/brands.vue";
import DressStyle from "@/components/section/home/dress-style.vue";
import HomeHeader from "@/components/section/home/home-header.vue";
import ProductListSec from "@/components/section/home/product-list-sec.vue";
import Reviews from "@/components/section/home/review.vue";
import { useProducts, useReviews } from "@/hook";
import type { Product } from "@/types";
import { computed } from "vue";

const { products, isLoading: productLoading } = useProducts();
const { reviews, isLoading: reviewLoading } = useReviews();

const newArrivalsData = computed<Product[]>(() => {
	return products.value?.slice(0, 4) || [];
});

const topSellingData = computed<Product[]>(() => {
	return products.value?.slice(1, 5) || [];
});
</script>

<template>
	<HomeHeader />
	<Brands />
	<div class="mt-10 flex flex-col gap-10">
		<ProductListSec
			title="New Arrivals"
			:data="newArrivalsData"
			view-all-link="/shop"
			:is-loading="productLoading"
		/>
		<ProductListSec
			title="Top Selling"
			:data="topSellingData"
			view-all-link="/shop"
			:is-loading="productLoading"
		/>
		<DressStyle />
		<Reviews :data="reviews || []" :is-loading="reviewLoading" />
	</div>
</template>
