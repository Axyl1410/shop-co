<script setup lang="ts">
import CartItem from "@/components/section/cart/cart-item.vue";
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
import type { CartType } from "@/types";
import { ShoppingCart } from "lucide-vue-next";
import { defineProps } from "vue";

interface Props {
	totalItems: number;
	data: CartType[];
	clearItemFromCart: (product: CartType) => void;
	addToCart: (product: CartType, quantity: number) => void;
	removeFromCart: (product: CartType, quantity: number) => void;
	getTotalPrice: number;
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

		<SheetContent class="w-full sm:max-w-md">
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
					<p className="text-muted-foreground text-sm text-center">
						Looks like you haven&apos;t added anything to your cart yet.
					</p>
				</div>
			</template>

			<template v-else>
				<div class="flex-1 space-y-4 overflow-y-auto py-4">
					<CartItem
						v-for="item in data"
						:key="item.id"
						:item="item"
						:clear-item-from-cart="clearItemFromCart"
						:add-to-cart="addToCart"
						:remove-from-cart="removeFromCart"
					/>
				</div>
			</template>

			<SheetFooter>
				<template v-if="totalItems">
					<div class="space-y-2 border-t pt-2">
						<div class="flex justify-between text-sm">
							<span>Subtotal:</span>
							<span class="font-semibold"> {{ getTotalPrice }} $</span>
						</div>
						<div class="flex justify-between text-sm">
							<span>Items:</span>
							<span>{{ totalItems }}</span>
						</div>
					</div>
				</template>
				<template v-if="totalItems">
					<SheetClose as-child>
						<Button as-child class="w-full">
							<router-link to="/checkout"> Proceed to Checkout </router-link>
						</Button>
					</SheetClose>
				</template>
				<template v-else>
					<SheetClose as-child>
						<Button class="w-full"> Continue Shopping </Button>
					</SheetClose>
				</template>
			</SheetFooter>
		</SheetContent>
	</Sheet>
</template>
