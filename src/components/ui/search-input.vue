<script setup lang="ts">
import { Search, X } from "lucide-vue-next";
import { ref, watch } from "vue";

interface Props {
	modelValue?: string;
	placeholder?: string;
	debounce?: number;
}

interface Emits {
	(e: "update:modelValue", value: string): void;
	(e: "search", value: string): void;
	(e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "",
	placeholder: "Tìm kiếm sản phẩm...",
	debounce: 300,
});

const emit = defineEmits<Emits>();

const localValue = ref(props.modelValue);
let debounceTimer: NodeJS.Timeout | null = null;

// Watch for external changes
watch(
	() => props.modelValue,
	(newValue) => {
		localValue.value = newValue;
	},
);

// Watch for local changes and emit with debounce
watch(localValue, (newValue) => {
	emit("update:modelValue", newValue);

	// Clear existing timer
	if (debounceTimer) {
		clearTimeout(debounceTimer);
	}

	// Set new timer for debounced search
	debounceTimer = setTimeout(() => {
		emit("search", newValue);
	}, props.debounce);
});

const clearSearch = () => {
	localValue.value = "";
	emit("clear");
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
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	</div>
</template>