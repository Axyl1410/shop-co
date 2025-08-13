<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useProducts } from "@/hook";
import { useProductSearch } from "@/hook/use-product-search";
import { CircleUserRound, Search, X } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AccountMenu from "./account-menu.vue";
import Navigation from "./navigation.vue";
import SheetMenu from "./sheet-menu.vue";
import ShoppingCartIcon from "./shopping-cart.vue";

const authStore = useAuthStore();
const { isAuthenticated, currentUser } = storeToRefs(authStore);

const cartStore = useCartStore();
const router = useRouter();

// Search functionality
const { products } = useProducts();
const { searchQuery, searchedProducts, clearSearch } = useProductSearch(products);

const showSearchResults = computed(() => {
	return searchQuery.value.trim().length > 0 && searchedProducts.value.length > 0;
});

// Debug function to get correct image path
const getProductImage = (product: any) => {
	const imageName = product.mainImage?.replace('/images/', '') || 'placeholder.png';
	const imagePath = `/src/assets/images/${imageName}`;
	console.log(`Product: ${product.name}, Image: ${imagePath}`);
	return imagePath;
};
</script>

<template>
	<div class="sticky top-0 z-20 bg-white">
		<div
			class="relative container mx-auto flex items-center justify-between px-4 py-5 md:justify-start md:py-6 xl:px-0"
		>
			<div class="flex items-center gap-2">
				<RouterLink to="/" class="font-integralCF mr-3 mb-2 text-2xl lg:mr-10 lg:text-[32px]"
					>SHOP.CO</RouterLink
				>
			</div>
			<Navigation />
			<div class="relative mr-3 hidden w-full md:flex lg:mr-10">
				<div
					class="relative w-full flex items-center overflow-hidden rounded-full bg-[#F0F0F0] transition-all focus-within:shadow-lg"
				>
					<Search class="absolute left-4 h-4 w-4 text-gray-400" />
					<input
						v-model="searchQuery"
						class="w-full bg-transparent py-3 pl-12 pr-10 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-black/40 [&::-webkit-search-cancel-button]:hidden"
						autocomplete="off"
						autocorrect="off"
						spellcheck="false"
						placeholder="Tìm kiếm sản phẩm..."
						type="text"
						name="search"
					/>
					<button
						v-if="searchQuery"
						@click="clearSearch"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
				
				<!-- Search Results Dropdown -->
				<div
					v-if="showSearchResults"
					class="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
				>
					<div class="p-4 border-b border-gray-100">
						<p class="text-sm font-medium text-gray-900">
							Tìm thấy {{ searchedProducts.length }} sản phẩm
						</p>
					</div>
					<div class="py-2">
						<div
							v-for="product in searchedProducts.slice(0, 5)"
							:key="product.id"
							class="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer"
							@click="router.push(`/product/${product.id}`)"
						>
							<img
								:src="getProductImage(product)"
								:alt="product.name"
								class="w-12 h-12 object-cover rounded-md"
								@error="$event.target.src = '/src/assets/images/placeholder.png'"
							/>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-gray-900 truncate">
									{{ product.name }}
								</p>
								<p class="text-xs text-gray-500 truncate">
									{{ product.brand }}
								</p>
							</div>
						</div>
					</div>
					<div class="p-4 border-t border-gray-100">
						<button
							@click="router.push('/shop')"
							class="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
						>
							Xem tất cả kết quả
						</button>
					</div>
				</div>
			</div>
			<div class="mb-1 flex items-center gap-4 md:gap-6">
				<button 
					@click="router.push('/shop')"
					class="size-5 md:hidden"
				>
					<Search class="size-5" />
				</button>
				<ShoppingCartIcon
					:total-items="cartStore.getTotalItems"
					:data="cartStore.getCart"
					:clear-item-from-cart="cartStore.clearItemFromCart"
					:add-to-cart="cartStore.addToCart"
					:remove-from-cart="cartStore.removeFromCart"
					:get-total-price="cartStore.getTotalPrice"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger class="flex items-center gap-1">
						<CircleUserRound class="size-5 md:size-6" />
						<span class="sr-only">Toggle account menu</span>
					</DropdownMenuTrigger>
					<AccountMenu
						:is-authenticated="isAuthenticated"
						:current-user="currentUser"
						:logout="authStore.logout"
					/>
				</DropdownMenu>
				<SheetMenu />
			</div>
		</div>
	</div>
</template>
