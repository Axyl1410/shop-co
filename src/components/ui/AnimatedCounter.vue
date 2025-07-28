<script setup lang="ts">
import { onMounted, ref } from "vue";

interface Props {
	from: number;
	to: number;
	duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
	duration: 5000,
});

const count = ref(props.from);

onMounted(() => {
	const animate = () => {
		const startTime = Date.now();
		const animateFrame = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / props.duration, 1);

			// Easing function (ease-out)
			const easeOut = 1 - Math.pow(1 - progress, 3);

			count.value = Math.round(props.from + (props.to - props.from) * easeOut);

			if (progress < 1) {
				requestAnimationFrame(animateFrame);
			}
		};
		requestAnimationFrame(animateFrame);
	};

	animate();
});
</script>

<template>
	<span>{{ count }}</span>
</template>
