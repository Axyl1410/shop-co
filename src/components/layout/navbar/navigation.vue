<script setup lang="ts">
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MenuList } from "@/constant";
</script>

<template>
	<NavigationMenu class="mr-2 hidden text-base md:flex lg:mr-7">
		<NavigationMenuList>
			<NavigationMenuItem>
				<NavigationMenuTrigger>Shop</NavigationMenuTrigger>
				<NavigationMenuContent>
					<ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
						<li v-for="component in MenuList" :key="component.id">
							<RouterLink
								:to="component.url"
								class="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
							>
								<div class="text-sm leading-none font-medium">{{ component.label }}</div>
								<p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
									{{ component.description }}
								</p>
							</RouterLink>
						</li>
					</ul>
				</NavigationMenuContent>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<RouterLink to="/shop#on-sale" :class="navigationMenuTriggerStyle()"> On Sale </RouterLink>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<RouterLink to="/shop#new-arrivals" :class="navigationMenuTriggerStyle()">
					New Arrivals
				</RouterLink>
			</NavigationMenuItem>
			<NavigationMenuItem>
				<RouterLink to="/shop#brands" :class="navigationMenuTriggerStyle()"> Brands </RouterLink>
			</NavigationMenuItem>
		</NavigationMenuList>
	</NavigationMenu>
</template>
