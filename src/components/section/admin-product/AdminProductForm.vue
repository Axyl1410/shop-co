<!-- AdminProductForm.vue -->
<template>
  <input type="file" @change="handleFileChange" />
  <img v-if="base64Image" :src="base64Image" alt="Preview" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const base64Image = ref<string>("");

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    base64Image.value = reader.result as string;
    // Gửi base64Image.value lên server hoặc lưu vào sản phẩm
  };
  reader.readAsDataURL(file);
}
</script>