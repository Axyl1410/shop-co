<script setup lang="ts">
import { Search, X } from "lucide-vue-next";
import { ref } from "vue";

interface Props {
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: "Tìm kiếm sản phẩm...",
});

const localValue = ref("");

const clearSearch = () => {
	localValue.value = "";
};
</script>

<template>
	<div class="relative flex items-center">
		<div class="relative flex-1">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				v-model="localValue"
				type="text"
				:placeholder="placeholder"
				class="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm font-medium placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
			/>
			<button
				v-if="localValue"
				@click="clearSearch"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	</div>
</template>
