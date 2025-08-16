<!-- components/Rating.vue -->
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: number; // Hỗ trợ v-model
  initialValue?: number; // Giá trị hiển thị ban đầu
  editable?: boolean; // Cho phép chỉnh sửa
  allowFraction?: boolean; // Cho phép nửa sao
  SVGclassName?: string;
  emptyClassName?: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: 0,
  editable: false,
  allowFraction: false,
  SVGclassName: "",
  emptyClassName: "",
  size: 20,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const stars = Array.from({ length: 5 }, (_, i) => i + 1);

// Giá trị hiển thị: ưu tiên modelValue nếu có, nếu không dùng initialValue
const value = computed({
  get: () => props.modelValue || props.initialValue,
  set: (newValue: number) => emit("update:modelValue", newValue),
});

const updateRating = (star: number) => {
  if (props.editable) {
    console.log("Selected star:", star); // Debug
    emit("update:modelValue", props.allowFraction ? star - 0.5 : star);
  }
};
</script>

<template>
  <div class="flex items-center">
    <svg
      v-for="star in stars"
      :key="star"
      :class="[
        props.SVGclassName,
        star <= value ? 'text-yellow-400' : props.emptyClassName,
        props.editable ? 'cursor-pointer' : 'cursor-default',
      ]"
      :width="props.size"
      :height="props.size"
      viewBox="0 0 24 24"
      fill="currentColor"
      @click="updateRating(star)"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  </div>
</template>