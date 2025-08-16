<template>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-medium text-gray-900">Product Variants</h3>
			<button
				@click="addVariant"
				type="button"
				class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
			>
				Add Variant
			</button>
		</div>

		<div class="space-y-4">
			<div
				v-for="(variant, index) in variants"
				:key="index"
				class="rounded-lg border border-gray-200 p-4"
			>
				<div class="mb-4 flex items-center justify-between">
					<h4 class="text-sm font-medium text-gray-900">Variant {{ index + 1 }}</h4>
					<button
						@click="removeVariant(index)"
						type="button"
						class="text-red-600 hover:text-red-800"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Size</label>
						<select
							v-model="variant.size"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">Select Size</option>
							<option value="XS">XS</option>
							<option value="S">S</option>
							<option value="M">M</option>
							<option value="L">L</option>
							<option value="XL">XL</option>
							<option value="XXL">XXL</option>
							<option value="26">26</option>
							<option value="28">28</option>
							<option value="30">30</option>
							<option value="32">32</option>
							<option value="34">34</option>
							<option value="36">36</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Color</label>
						<input
							v-model="variant.color"
							type="text"
							required
							placeholder="e.g., Black, Red"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Color Code</label>
						<div class="flex items-center space-x-2">
							<input
								v-model="variant.colorCode"
								type="color"
								class="h-8 w-8 rounded border border-gray-300"
							/>
							<input
								v-model="variant.colorCode"
								type="text"
								placeholder="#000000"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">SKU</label>
						<input
							v-model="variant.sku"
							type="text"
							required
							:placeholder="generateSku(variant)"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Sale Price</label>
						<input
							v-model.number="variant.salePrice"
							type="number"
							step="0.01"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
						<input
							v-model.number="variant.stockQuantity"
							type="number"
							min="0"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>
				</div>
			</div>

			<div v-if="variants.length === 0" class="py-8 text-center text-gray-500">
				No variants added yet. Click "Add Variant" to get started.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ProductVariant } from "@/types";
import { ref, watch } from "vue";

interface Props {
	productId: number;
	initialVariants?: Omit<ProductVariant, "id">[];
}

interface Emits {
	(e: "update:variants", variants: Omit<ProductVariant, "id">[]): void;
}

const props = withDefaults(defineProps<Props>(), {
	initialVariants: () => [],
});

const emit = defineEmits<Emits>();

const variants = ref<Omit<ProductVariant, "id">[]>([]);

// Initialize variants
if (props.initialVariants.length > 0) {
	variants.value = [...props.initialVariants];
} else {
	// Add default variant
	addVariant();
}

// Watch for changes and emit updates
watch(
	variants,
	(newVariants) => {
		emit("update:variants", newVariants);
	},
	{ deep: true },
);

const addVariant = () => {
	variants.value.push({
		productId: props.productId,
		size: "",
		color: "",
		colorCode: "#000000",
		sku: "",
		salePrice: 0,
		stockQuantity: 0,
	});
};

const removeVariant = (index: number) => {
	variants.value.splice(index, 1);
};

const generateSku = (variant: Omit<ProductVariant, "id">) => {
	if (variant.size && variant.color) {
		return `${props.productId}-${variant.size}-${variant.color.toUpperCase().substring(0, 3)}`;
	}
	return "";
};
</script>
