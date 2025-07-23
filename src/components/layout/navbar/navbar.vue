<script setup lang="ts">
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MenuList } from "@/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { useCartStore } from "@/stores/use-cart-store";
import { CircleUserRound, Search } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import AccountMenu from "./account-menu.vue";
import SheetMenu from "./sheet-menu.vue";
import ShoppingCartIcon from "./shopping-cart.vue";

const authStore = useAuthStore();
const { isAuthenticated, currentUser } = storeToRefs(authStore);

const cartStore = useCartStore();
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

			<NavigationMenu class="mr-2 hidden text-base md:flex lg:mr-7">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Shop</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
								<li v-for="component in MenuList" :key="component.id">
									<NavigationMenuLink as-child>
										<RouterLink
											:to="component.url"
											class="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
										>
											<div class="text-sm leading-none font-medium">{{ component.label }}</div>
											<p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
												{{ component.description }}
											</p>
										</RouterLink>
									</NavigationMenuLink>
								</li>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink href="/shop#on-sale" :class="navigationMenuTriggerStyle()">
							On Sale
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink href="/shop#new-arrivals" :class="navigationMenuTriggerStyle()">
							New Arrivals
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink href="/shop#brands" :class="navigationMenuTriggerStyle()">
							Brands
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			<div
				class="relative mr-3 hidden w-full items-center overflow-hidden rounded-full bg-[#F0F0F0] pl-4 transition-all focus-within:shadow-lg md:flex lg:mr-10"
			>
				<div class="mr-3">
					<Search class="text-muted-foreground ml-4" />
				</div>
				<input
					class="w-full bg-transparent py-3 pr-4 outline-none placeholder:text-sm placeholder:font-normal placeholder:text-black/40"
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					placeholder="Search for products..."
					type="search"
					name="search"
				/>
			</div>
			<div class="mb-1 flex items-center gap-4 md:gap-6">
				<Search class="size-5 md:hidden" />
				<ShoppingCartIcon :total-items="cartStore.getTotalItems" />
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
