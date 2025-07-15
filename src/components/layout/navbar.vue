<script setup lang="ts">
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import type { MenuListData } from '@/types'
import { CircleUserRound, Menu, Search, ShoppingCart } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const data: MenuListData = [
	{
		id: 1,
		label: "Men's clothes",
		url: '/shop#men-clothes',
		description: 'In attractive and spectacular colors and designs',
	},
	{
		id: 2,
		label: "Women's clothes",
		url: '/shop#women-clothes',
		description: 'Ladies, your style and tastes are important to us',
	},
	{
		id: 3,
		label: 'Kids clothes',
		url: '/shop#kids-clothes',
		description: 'For all ages, with happy and beautiful colors',
	},
	{
		id: 4,
		label: 'Bags and Shoes',
		url: '/shop#bag-shoes',
		description: 'Suitable for men, women and all tastes and styles',
	},
]
</script>

<template>
	<div class="sticky top-0 z-20 bg-white">
		<div
			class="relative container mx-auto flex items-center justify-between px-4 py-5 md:justify-start md:py-6 xl:px-0"
		>
			<div class="flex items-center gap-2">
				<Menu class="mb-1 md:hidden" />
				<RouterLink to="/" class="font-integralCF mr-3 mb-2 text-2xl lg:mr-10 lg:text-[32px]"
					>SHOP.CO</RouterLink
				>
			</div>

			<NavigationMenu class="mr-2 hidden md:flex lg:mr-7">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Shop</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
								<li v-for="component in data" :key="component.id">
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
			<div class="flex gap-4 md:gap-6">
				<Search class="md:hidden" />
				<ShoppingCart />
				<CircleUserRound />
			</div>
		</div>
	</div>
</template>
