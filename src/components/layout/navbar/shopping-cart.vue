<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { calculatePrice } from "@/lib/utils";
import type { CartType } from "@/types";
import { ShoppingCart } from "lucide-vue-next";
import { defineProps } from "vue";

interface Props {
	totalItems: number;
	data: CartType[];
}

defineProps<Props>();
</script>

<template>
	<Sheet>
		<SheetTrigger as-child>
			<div class="relative">
				<ShoppingCart class="size-5 md:size-6" />
				<span
					v-if="totalItems"
					class="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
				>
					{{ totalItems }}
				</span>
			</div>
		</SheetTrigger>

		<SheetContent>
			<SheetHeader>
				<SheetTitle className="text-xl">Your Cart</SheetTitle>
				<SheetDescription>
					{{ totalItems }} {{ totalItems === 1 ? "item" : "items" }} in your cart
				</SheetDescription>
			</SheetHeader>
			<template v-if="!totalItems">
				<div className="flex flex-col items-center justify-center px-4 gap-4 py-8">
					<ShoppingCart className="text-muted-foreground h-12 w-12" />
					<h3 className="text-lg font-semibold">Your cart is empty</h3>
					<p className="text-muted-foreground text-sm">
						Looks like you haven&apos;t added anything to your cart yet.
					</p>
				</div>
			</template>
			<template v-else>
				<template v-for="item in data" :key="item.id">
					<div class="flex items-center justify-between px-4">
						<div class="flex items-center gap-2">
							<img
								:src="`/src/assets${item.images[0]}`"
								:alt="item.name"
								class="h-12 w-12 rounded-md"
							/>
							<div class="flex flex-col">
								<h3 class="text-lg font-semibold">{{ item.name }}</h3>
								<p class="text-muted-foreground text-sm">
									{{ item.quantity }} x
									{{ calculatePrice(item).finalPrice }}
								</p>
							</div>
						</div>
					</div>
				</template>
			</template>

			<SheetFooter>
				<template v-if="totalItems">
					<SheetClose as-child>
						<Button as-child>
							<router-link to="/checkout"> Checkout </router-link>
						</Button>
					</SheetClose>
				</template>
				<template v-else>
					<SheetClose as-child>
						<Button> Continue Shopping </Button>
					</SheetClose>
				</template>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</template>
