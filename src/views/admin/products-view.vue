<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { useCategories } from "../../hook/use-categories";
import { useProducts } from "../../hook/use-products";
import type { Product } from "../../types";

const {
	products,
	createProduct,
	updateProduct,
	deleteProduct,
	activateProduct,
	isDeleting,
	isActivating,
	isCreating,
	isUpdating,
} = useProducts();

const { categories } = useCategories();

const showForm = ref(false);
const editingProduct = ref<Product | undefined>(undefined);
const isFormEditing = ref(false);

// Form validation schema
const formSchema = toTypedSchema(
	z.object({
		name: z.string().min(1, "Product name is required"),
		sku: z.string().min(1, "SKU is required"),
		brand: z.string().min(1, "Brand is required"),
		categoryId: z.number().min(1, "Category is required"),
		originalPrice: z.number().min(0, "Price must be positive"),
		discountPercentage: z.number().min(0).max(100, "Discount must be between 0-100%"),
		weight: z.number().min(0, "Weight must be positive"),
		rating: z.number().min(0).max(5, "Rating must be between 0-5"),
		description: z.string().min(1, "Description is required"),
		shortDescription: z.string().min(1, "Short description is required"),
		mainImage: z.string().min(1, "Main image is required"),
		dimensions: z.object({
			length: z.number().min(0, "Length must be positive"),
			width: z.number().min(0, "Width must be positive"),
			height: z.number().min(0, "Height must be positive"),
		}),
	}),
);

// Form validation
const { handleSubmit, setFieldValue, values, resetForm } = useForm({
	validationSchema: formSchema,
	initialValues: {
		name: "",
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
		mainImage: "",
		rating: 0,
	},
});

// Delete confirmation modal
const showDeleteModal = ref(false);
const deletingProduct = ref<Product | undefined>(undefined);

// Additional form data for non-validated fields
const additionalImagesText = ref("");

// Computed properties
const activeProducts = computed(() => products.value?.filter((p) => p.isActive) || []);
const inactiveProducts = computed(() => products.value?.filter((p) => !p.isActive) || []);

// Get category name by ID
const getCategoryName = (categoryId: number) => {
	const category = categories.value?.find((c) => c.id === categoryId);
	return category?.name || "Unknown";
};

// Calculate sale price
const getSalePrice = (product: Product) => {
	if (product.discountPercentage > 0) {
		return product.originalPrice * (1 - product.discountPercentage / 100);
	}
	return product.originalPrice;
};

const handleAddProduct = () => {
	console.log("=== ADD PRODUCT CLICKED ===");
	console.log("Before - showForm:", showForm.value);
	console.log("Before - isFormEditing:", isFormEditing.value);
	console.log("Before - editingProduct:", editingProduct.value);

	editingProduct.value = undefined;
	isFormEditing.value = false;
	showForm.value = true;

	// Reset form
	resetForm();
	additionalImagesText.value = "";

	console.log("After - showForm:", showForm.value);
	console.log("After - isFormEditing:", isFormEditing.value);
	console.log("After - editingProduct:", editingProduct.value);
	console.log("=== END ADD PRODUCT ===");
};

const handleEditProduct = (product: Product) => {
	console.log("=== EDIT PRODUCT CLICKED ===");
	console.log("Product:", product);
	console.log("Before - showForm:", showForm.value);
	console.log("Before - isFormEditing:", isFormEditing.value);
	console.log("Before - editingProduct:", editingProduct.value);

	editingProduct.value = product;
	isFormEditing.value = true;
	showForm.value = true;

	// Populate form with product data
	setFieldValue("name", product.name);
	setFieldValue("sku", product.sku);
	setFieldValue("brand", product.brand);
	setFieldValue("categoryId", product.categoryId);
	setFieldValue("originalPrice", product.originalPrice);
	setFieldValue("discountPercentage", product.discountPercentage);
	setFieldValue("weight", product.weight);
	setFieldValue("rating", product.rating);
	setFieldValue("description", product.description);
	setFieldValue("shortDescription", product.shortDescription);
	setFieldValue("mainImage", product.mainImage);
	setFieldValue("dimensions.length", product.dimensions.length);
	setFieldValue("dimensions.width", product.dimensions.width);
	setFieldValue("dimensions.height", product.dimensions.height);

	additionalImagesText.value = product.images.join("\n");

	console.log("After - showForm:", showForm.value);
	console.log("After - isFormEditing:", isFormEditing.value);
	console.log("After - editingProduct:", editingProduct.value);
	console.log("=== END EDIT PRODUCT ===");
};

const handleCloseForm = () => {
	console.log("=== CLOSE FORM CLICKED ===");
	console.log("Before - showForm:", showForm.value);
	console.log("Before - isFormEditing:", isFormEditing.value);
	console.log("Before - editingProduct:", editingProduct.value);

	showForm.value = false;
	editingProduct.value = undefined;
	isFormEditing.value = false;

	console.log("After - showForm:", showForm.value);
	console.log("After - isFormEditing:", isFormEditing.value);
	console.log("After - editingProduct:", editingProduct.value);
	console.log("=== END CLOSE FORM ===");
};

const onSubmit = handleSubmit(async (values) => {
	console.log("=== FORM SUBMITTED ===");
	console.log("Form values:", values);
	console.log("Additional images:", additionalImagesText.value);

	// Process additional images
	const images = additionalImagesText.value
		.split("\n")
		.map((url) => url.trim())
		.filter((url) => url.length > 0);

	// Generate slug if not provided
	const slug = values.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	const productData = {
		...values,
		slug,
		images,
		tags: [], // Empty tags for now
		isActive: true,
		isFeatured: false,
		isNew: false,
		reviewCount: 0,
		viewCount: 0,
	};

	console.log("Processed product data:", productData);

	try {
		if (isFormEditing.value && editingProduct.value) {
			// Update existing product
			console.log("Updating product:", editingProduct.value.id);
			await updateProduct({
				id: editingProduct.value.id,
				product: productData,
			});
		} else {
			// Create new product
			console.log("Creating new product");
			await createProduct(productData);
		}

		// Close form after submission
		handleCloseForm();
	} catch (error) {
		console.error("Error saving product:", error);
		alert("Error saving product. Please try again.");
	}
});

const handleDeleteProduct = (product: Product) => {
	console.log("=== DELETE PRODUCT CLICKED ===");
	console.log("Product:", product);

	deletingProduct.value = product;
	showDeleteModal.value = true;
};

const confirmDelete = async () => {
	if (deletingProduct.value) {
		console.log("=== CONFIRMING DELETE ===");
		console.log("Deleting product:", deletingProduct.value);

		await deleteProduct(deletingProduct.value.id);

		// Close modal
		showDeleteModal.value = false;
		deletingProduct.value = undefined;
	}
};

const cancelDelete = () => {
	console.log("=== CANCELLING DELETE ===");
	showDeleteModal.value = false;
	deletingProduct.value = undefined;
};

const handleActivateProduct = async (product: Product) => {
	if (confirm(`Are you sure you want to activate "${product.name}"?`)) {
		await activateProduct(product.id);
	}
};
</script>

<template>
	<div class="space-y-6 py-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Products Management</h1>
			<Button
				@click="handleAddProduct"
				:disabled="isCreating || isUpdating"
				class="bg-blue-600 hover:bg-blue-700"
			>
				{{ isCreating ? "Creating..." : "Add Product" }}
			</Button>
		</div>

		<!-- Active Products Table -->
		<div class="rounded-lg bg-white shadow">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Active Products</h3>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Product
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Category
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Price
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Rating
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							<tr v-for="product in activeProducts" :key="product.id">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="h-10 w-10 flex-shrink-0">
											<img
												:src="`/src/assets${product.mainImage}`"
												:alt="product.name"
												class="h-10 w-10 rounded object-cover"
											/>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
											<div class="text-sm text-gray-500">SKU: {{ product.sku }}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									{{ getCategoryName(product.categoryId) }}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									<div>
										<span class="text-lg font-semibold"
											>${{ getSalePrice(product).toFixed(2) }}</span
										>
										<span
											v-if="product.discountPercentage > 0"
											class="ml-2 text-sm text-gray-500 line-through"
										>
											${{ product.originalPrice.toFixed(2) }}
										</span>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									<div class="text-sm text-gray-900">{{ product.rating }}/5</div>
									<div class="text-xs text-gray-500">{{ product.reviewCount }} reviews</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
									>
										Active
									</span>
								</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<button
										@click="handleEditProduct(product)"
										class="mr-3 text-blue-600 hover:text-blue-900"
									>
										Edit
									</button>
									<button
										@click="handleDeleteProduct(product)"
										:disabled="isDeleting"
										class="text-red-600 hover:text-red-900 disabled:opacity-50"
									>
										{{ isDeleting ? "Deleting..." : "Delete" }}
									</button>
								</td>
							</tr>
							<tr v-if="activeProducts.length === 0">
								<td colspan="6" class="px-6 py-4 text-center text-gray-500">
									No active products found
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Inactive Products Table -->
		<div v-if="inactiveProducts.length > 0" class="rounded-lg bg-white shadow">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Inactive Products</h3>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Product
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Category
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Price
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Rating
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							<tr v-for="product in inactiveProducts" :key="product.id">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="h-10 w-10 flex-shrink-0">
											<img
												:src="product.mainImage"
												:alt="product.name"
												class="h-10 w-10 rounded object-cover"
											/>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
											<div class="text-sm text-gray-500">SKU: {{ product.sku }}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									{{ getCategoryName(product.categoryId) }}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									<div>
										<span class="text-lg font-semibold"
											>${{ getSalePrice(product).toFixed(2) }}</span
										>
										<span
											v-if="product.discountPercentage > 0"
											class="ml-2 text-sm text-gray-500 line-through"
										>
											${{ product.originalPrice.toFixed(2) }}
										</span>
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
									<div class="text-sm text-gray-900">{{ product.rating }}/5</div>
									<div class="text-xs text-gray-500">{{ product.reviewCount }} reviews</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex rounded-full bg-red-100 px-2 text-xs leading-5 font-semibold text-red-800"
									>
										Inactive
									</span>
								</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
									<button
										@click="handleActivateProduct(product)"
										:disabled="isActivating"
										class="mr-3 text-green-600 hover:text-green-900 disabled:opacity-50"
									>
										{{ isActivating ? "Activating..." : "Activate" }}
									</button>
									<button
										@click="handleEditProduct(product)"
										class="text-blue-600 hover:text-blue-900"
									>
										Edit
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Product Form Modal -->
		<div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
			<div class="flex min-h-screen items-center justify-center p-4">
				<!-- Backdrop -->
				<div class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"></div>

				<!-- Modal Content -->
				<div class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
					<!-- Close Button -->
					<div class="absolute top-4 right-4">
						<button @click="handleCloseForm" class="text-gray-400 hover:text-gray-600">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<!-- Modal Header -->
					<div class="mb-6">
						<h2 class="text-xl font-semibold text-gray-900">
							{{ isFormEditing ? "Edit Product" : "Add New Product" }}
						</h2>
					</div>

					<!-- Product Form -->
					<form @submit.prevent="onSubmit" class="space-y-6">
						<!-- Basic Information -->
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField v-slot="{ componentField }" name="name">
								<FormItem>
									<FormLabel>Product Name *</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Enter product name"
											v-bind="componentField"
											:model-value="values.name"
											@update:model-value="
												(value) => {
													setFieldValue('name', String(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="sku">
								<FormItem>
									<FormLabel>SKU *</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Enter SKU"
											v-bind="componentField"
											:model-value="values.sku"
											@update:model-value="
												(value) => {
													setFieldValue('sku', String(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="brand">
								<FormItem>
									<FormLabel>Brand *</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Enter brand"
											v-bind="componentField"
											:model-value="values.brand"
											@update:model-value="
												(value) => {
													setFieldValue('brand', String(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="categoryId">
								<FormItem>
									<FormLabel>Category *</FormLabel>
									<FormControl>
										<Select
											:model-value="values.categoryId"
											@update:model-value="
												(value) => {
													setFieldValue('categoryId', Number(value));
												}
											"
											v-bind="componentField"
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Category" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem
													v-for="category in categories"
													:key="category.id"
													:value="category.id.toString()"
												>
													{{ category.name }}
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="originalPrice">
								<FormItem>
									<FormLabel>Original Price *</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											v-bind="componentField"
											:model-value="values.originalPrice"
											@update:model-value="
												(value) => {
													setFieldValue('originalPrice', Number(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="discountPercentage">
								<FormItem>
									<FormLabel>Discount Percentage</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											max="100"
											placeholder="0"
											v-bind="componentField"
											:model-value="values.discountPercentage"
											@update:model-value="
												(value) => {
													setFieldValue('discountPercentage', Number(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="weight">
								<FormItem>
									<FormLabel>Weight (kg) *</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											v-bind="componentField"
											:model-value="values.weight"
											@update:model-value="
												(value) => {
													setFieldValue('weight', Number(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>

							<FormField v-slot="{ componentField }" name="rating">
								<FormItem>
									<FormLabel>Rating *</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.1"
											min="0"
											max="5"
											placeholder="0.0"
											v-bind="componentField"
											:model-value="values.rating"
											@update:model-value="
												(value) => {
													setFieldValue('rating', Number(value));
												}
											"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>

						<!-- Description -->
						<FormField v-slot="{ componentField }" name="description">
							<FormItem>
								<FormLabel>Description *</FormLabel>
								<FormControl>
									<textarea
										rows="3"
										placeholder="Enter product description"
										class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
										v-bind="componentField"
										:model-value="values.description"
										@update:model-value="
											(value: any) => {
												setFieldValue('description', String(value));
											}
										"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<FormField v-slot="{ componentField }" name="shortDescription">
							<FormItem>
								<FormLabel>Short Description *</FormLabel>
								<FormControl>
									<textarea
										rows="2"
										placeholder="Enter short description"
										class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
										v-bind="componentField"
										:model-value="values.shortDescription"
										@update:model-value="
											(value: any) => {
												setFieldValue('shortDescription', String(value));
											}
										"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<!-- Dimensions -->
						<div>
							<label class="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
							<div class="grid grid-cols-3 gap-4">
								<div>
									<label class="block text-xs text-gray-600">Length</label>
									<input
										:value="values.dimensions?.length || 0"
										@input="
											(e) =>
												setFieldValue(
													'dimensions.length',
													Number((e.target as HTMLInputElement).value),
												)
										"
										type="number"
										step="0.1"
										min="0"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
										placeholder="0.0"
									/>
								</div>
								<div>
									<label class="block text-xs text-gray-600">Width</label>
									<input
										:value="values.dimensions?.width || 0"
										@input="
											(e) =>
												setFieldValue(
													'dimensions.width',
													Number((e.target as HTMLInputElement).value),
												)
										"
										type="number"
										step="0.1"
										min="0"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
										placeholder="0.0"
									/>
								</div>
								<div>
									<label class="block text-xs text-gray-600">Height</label>
									<input
										:value="values.dimensions?.height || 0"
										@input="
											(e) =>
												setFieldValue(
													'dimensions.height',
													Number((e.target as HTMLInputElement).value),
												)
										"
										type="number"
										step="0.1"
										min="0"
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
										placeholder="0.0"
									/>
								</div>
							</div>
						</div>

						<!-- Images -->
						<FormField v-slot="{ componentField }" name="mainImage">
							<FormItem>
								<FormLabel>Main Image URL *</FormLabel>
								<FormControl>
									<Input
										type="url"
										placeholder="https://example.com/image.jpg"
										v-bind="componentField"
										:model-value="values.mainImage"
										@update:model-value="
											(value: any) => {
												setFieldValue('mainImage', String(value));
											}
										"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<div>
							<label class="block text-sm font-medium text-gray-700"
								>Additional Images (one per line)</label
							>
							<textarea
								v-model="additionalImagesText"
								rows="3"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
							></textarea>
						</div>
					</form>

					<!-- Buttons -->
					<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3">
						<Button variant="outline" @click="handleCloseForm" class="w-full sm:w-auto">
							Cancel
						</Button>
						<Button @click="onSubmit" :disabled="isCreating || isUpdating" class="w-full sm:w-auto">
							{{
								isFormEditing
									? isUpdating
										? "Updating..."
										: "Update Product"
									: isCreating
										? "Creating..."
										: "Create Product"
							}}
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
			<div class="flex min-h-screen items-center justify-center p-4">
				<!-- Backdrop -->
				<div class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"></div>

				<!-- Modal Content -->
				<div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
					<!-- Modal Header -->
					<div class="mb-4">
						<h3 class="text-lg font-medium text-gray-900">Confirm Delete</h3>
						<p class="mt-2 text-sm text-gray-500">
							Are you sure you want to delete "<strong>{{ deletingProduct?.name }}</strong
							>"?
						</p>
						<p class="mt-2 text-xs text-gray-400">
							This will set the product as inactive. You can reactivate it later from the inactive
							products list.
						</p>
					</div>

					<!-- Modal Actions -->
					<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3">
						<Button variant="outline" @click="cancelDelete" class="w-full sm:w-auto">
							Cancel
						</Button>
						<Button
							variant="destructive"
							@click="confirmDelete"
							:disabled="isDeleting"
							class="w-full sm:w-auto"
						>
							{{ isDeleting ? "Deleting..." : "Delete Product" }}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
