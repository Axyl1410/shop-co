<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuList } from "@/constant";
import { Menu } from "lucide-vue-next";
</script>

<template>
	<Sheet>
		<SheetTrigger as-child>
			<Menu class="size-5 md:hidden" />
		</SheetTrigger>
		<SheetContent>
			<SheetHeader>
				<SheetTitle>Menu</SheetTitle>
			</SheetHeader>

			<div class="flex flex-col gap-4 px-4">
				<div class="space-y-2">
					<div class="space-y-2">
						<RouterLink
							v-for="item in MenuList"
							:key="item.id"
							:to="item.url"
							class="hover:text-primary block py-2 text-sm transition-colors"
						>
							<div class="font-medium">{{ item.label }}</div>
							<p class="text-muted-foreground text-xs">{{ item.description }}</p>
						</RouterLink>
					</div>
				</div>

				<div class="space-y-2">
					<RouterLink
						to="/shop#on-sale"
						class="hover:text-primary block py-2 text-sm transition-colors"
					>
						On Sale
					</RouterLink>
					<RouterLink
						to="/shop#new-arrivals"
						class="hover:text-primary block py-2 text-sm transition-colors"
					>
						New Arrivals
					</RouterLink>
					<RouterLink
						to="/shop#brands"
						class="hover:text-primary block py-2 text-sm transition-colors"
					>
						Brands
					</RouterLink>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</template>
