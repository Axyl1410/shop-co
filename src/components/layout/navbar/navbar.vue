<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCartStore } from "@/stores/use-cart-store";
import { CircleUserRound, Search } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { ref } from "vue";
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
const searchQuery = ref("");
let searchTimer: NodeJS.Timeout | null = null;

const handleSearch = () => {
	if (searchTimer) {
		clearTimeout(searchTimer);
	}

	searchTimer = setTimeout(() => {
		if (searchQuery.value.trim()) {
			// Navigate to shop with search query
			router.push({
				path: "/shop",
				query: { search: searchQuery.value.trim() },
			});
		}
	}, 300);
};

const handleSearchKeydown = (event: KeyboardEvent) => {
	if (event.key === "Enter") {
		event.preventDefault();
		if (searchQuery.value.trim()) {
			router.push({
				path: "/shop",
				query: { search: searchQuery.value.trim() },
			});
		}
	}
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
			<div
				class="relative mr-3 hidden w-full items-center overflow-hidden rounded-full bg-[#F0F0F0] pl-4 transition-all focus-within:shadow-lg md:flex lg:mr-10"
			>
				<div class="mr-3">
					<Search class="text-muted-foreground ml-4" />
				</div>
				<input
					v-model="searchQuery"
					@input="handleSearch"
					@keydown="handleSearchKeydown"
					class="w-full bg-transparent py-3 pr-4 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-black/40"
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					placeholder="Tìm kiếm sản phẩm..."
					type="search"
					name="search"
				/>
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
