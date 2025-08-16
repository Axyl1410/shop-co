<!-- AdminProductForm.vue -->
<template>
	<div class="space-y-6">
		<div class="mb-6">
			<h2 class="text-xl font-semibold text-gray-900">
				{{ isEditing ? "Edit Product" : "Add New Product" }}
			</h2>
		</div>

		<form @submit.prevent="handleSubmit" class="space-y-6">
			<!-- Basic Information -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label class="block text-sm font-medium text-gray-700">Product Name</label>
					<input
						v-model="form.name"
						type="text"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">SKU</label>
					<input
						v-model="form.sku"
						type="text"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Brand</label>
					<input
						v-model="form.brand"
						type="text"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Category</label>
					<select
						v-model="form.categoryId"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					>
						<option value="">Select Category</option>
						<option v-for="category in categories" :key="category.id" :value="category.id">
							{{ category.name }}
						</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Original Price</label>
					<input
						v-model.number="form.originalPrice"
						type="number"
						step="0.01"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Discount Percentage</label>
					<input
						v-model.number="form.discountPercentage"
						type="number"
						min="0"
						max="100"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Weight (kg)</label>
					<input
						v-model.number="form.weight"
						type="number"
						step="0.01"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Rating</label>
					<input
						v-model.number="form.rating"
						type="number"
						step="0.1"
						min="0"
						max="5"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>
			</div>

			<!-- Dimensions -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Length (cm)</label>
					<input
						v-model.number="form.dimensions.length"
						type="number"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Width (cm)</label>
					<input
						v-model.number="form.dimensions.width"
						type="number"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Height (cm)</label>
					<input
						v-model.number="form.dimensions.height"
						type="number"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>
			</div>

			<!-- Descriptions -->
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700">Short Description</label>
					<input
						v-model="form.shortDescription"
						type="text"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Full Description</label>
					<textarea
						v-model="form.description"
						rows="4"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					></textarea>
				</div>
			</div>

			<!-- Images -->
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700">Main Image URL</label>
					<input
						v-model="form.mainImage"
						type="url"
						required
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700"
						>Additional Images (one per line)</label
					>
					<textarea
						v-model="additionalImagesText"
						rows="3"
						placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					></textarea>
				</div>
			</div>

			<!-- Tags -->
			<div>
				<label class="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
				<input
					v-model="tagsText"
					type="text"
					placeholder="casual, cotton, modern"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				/>
			</div>

			<!-- Product Variants -->
			<ProductVariantsForm
				:product-id="props.product?.id || 0"
				:initial-variants="productVariants"
				@update:variants="handleVariantsUpdate"
			/>

			<!-- Flags -->
			<div class="flex space-x-6">
				<label class="flex items-center">
					<input
						v-model="form.isActive"
						type="checkbox"
						class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					<span class="ml-2 text-sm text-gray-700">Active</span>
				</label>

				<label class="flex items-center">
					<input
						v-model="form.isFeatured"
						type="checkbox"
						class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					<span class="ml-2 text-sm text-gray-700">Featured</span>
				</label>

				<label class="flex items-center">
					<input
						v-model="form.isNew"
						type="checkbox"
						class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
					<span class="ml-2 text-sm text-gray-700">New</span>
				</label>
			</div>

			<!-- Submit Buttons -->
			<div class="flex justify-end space-x-3">
				<DialogClose as-child>
					<button
						type="button"
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
					>
						Cancel
					</button>
				</DialogClose>
				<button
					type="submit"
					:disabled="isSubmitting"
					class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
				>
					{{ isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product" }}
				</button>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { DialogClose } from "@/components/ui/dialog";
import { useCategories } from "@/hook/use-categories";
import { useProductVariants } from "@/hook/use-product-variants";
import type { Product, ProductVariant } from "@/types";
import { onMounted, ref, watch } from "vue";
import ProductVariantsForm from "./ProductVariantsForm.vue";

interface Props {
	product?: Product;
	isEditing?: boolean;
}

interface Emits {
	(e: "saved", product: Omit<Product, "id" | "createdAt" | "updatedAt">): void;
}

const props = withDefaults(defineProps<Props>(), {
	isEditing: false,
});

const emit = defineEmits<Emits>();

const { categories } = useCategories();
const { variants: productVariantsData } = useProductVariants(props.product?.id);

const form = ref({
	name: "",
	slug: "",
	description: "",
	shortDescription: "",
	categoryId: 0,
	brand: "",
	sku: "",
	originalPrice: 0,
	discountPercentage: 0,
	weight: 0,
	dimensions: {
		length: 0,
		width: 0,
		height: 0,
	},
	images: [] as string[],
	mainImage: "",
	tags: [] as string[],
	isActive: true,
	isFeatured: false,
	isNew: false,
	rating: 0,
	reviewCount: 0,
	viewCount: 0,
});

const additionalImagesText = ref("");
const tagsText = ref("");
const isSubmitting = ref(false);
const productVariants = ref<Omit<ProductVariant, "id">[]>([]);

// Watch for changes in additionalImagesText and tagsText to update form
watch(additionalImagesText, (newValue) => {
	form.value.images = newValue
		.split("\n")
		.map((url) => url.trim())
		.filter((url) => url.length > 0);
});

watch(tagsText, (newValue) => {
	form.value.tags = newValue
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
});

// Initialize form when editing
onMounted(() => {
	if (props.isEditing && props.product) {
		form.value = { ...props.product };
		additionalImagesText.value = form.value.images.join("\n");
		tagsText.value = form.value.tags.join(", ");
		// Initialize variants if editing
		if (props.product.id && productVariantsData.value) {
			productVariants.value = productVariantsData.value.map((v) => ({
				productId: v.productId,
				size: v.size,
				color: v.color,
				colorCode: v.colorCode,
				sku: v.sku,
				salePrice: v.salePrice,
				stockQuantity: v.stockQuantity,
			}));
		}
	}
});

const handleVariantsUpdate = (variants: Omit<ProductVariant, "id">[]) => {
	productVariants.value = variants;
};

const handleSubmit = async () => {
	isSubmitting.value = true;

	try {
		// Generate slug from name if not provided
		if (!form.value.slug) {
			form.value.slug = form.value.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");
		}

		// Update images array
		form.value.images = additionalImagesText.value
			.split("\n")
			.map((url) => url.trim())
			.filter((url) => url.length > 0);

		// Update tags array
		form.value.tags = tagsText.value
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);

		emit("saved", form.value);
	} catch (error) {
		console.error("Error saving product:", error);
	} finally {
		isSubmitting.value = false;
	}
};
</script>
