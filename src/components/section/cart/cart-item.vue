<script setup lang="ts">
import { calculatePrice } from "@/lib/utils";
import type { CartType, Product } from "@/types";
import { Minus, Plus, X } from "lucide-vue-next";

interface Props {
	item: CartType;
	clearItemFromCart: (product: Product) => void;
	addToCart: (product: Product, quantity: number) => void;
	removeFromCart: (product: Product, quantity: number) => void;
}

defineProps<Props>();
</script>

<template>
	<div class="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
		<div class="relative">
			<img
				:src="`/src/assets${item.images[0]}`"
				:alt="item.name"
				class="h-16 w-16 rounded-md object-cover"
			/>
			<button
				@click="clearItemFromCart(item)"
				class="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
				title="Remove item"
			>
				<X class="h-3 w-3" />
			</button>
		</div>

		<div class="min-w-0 flex-1">
			<h3 class="truncate text-sm font-semibold">{{ item.name }}</h3>
			<p class="text-muted-foreground text-xs">
				{{ calculatePrice(item).finalPrice }}
			</p>

			<div class="mt-2 flex items-center gap-2">
				<button
					@click="removeFromCart(item, 1)"
					:disabled="item.quantity <= 1"
					class="rounded-full bg-gray-200 p-1 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
					title="Decrease quantity"
				>
					<Minus class="h-3 w-3" />
				</button>

				<span class="min-w-[2rem] text-center text-sm font-medium">
					{{ item.quantity }}
				</span>

				<button
					@click="addToCart(item, 1)"
					class="rounded-full bg-gray-200 p-1 transition-colors hover:bg-gray-300"
					title="Increase quantity"
				>
					<Plus class="h-3 w-3" />
				</button>
			</div>
		</div>

		<div class="text-right">
			<p class="text-sm font-semibold">{{ calculatePrice(item).finalPrice }} $</p>
			<p class="text-muted-foreground text-xs">
				{{ item.quantity }} x {{ calculatePrice(item).finalPrice }}
			</p>
		</div>
	</div>
</template>
