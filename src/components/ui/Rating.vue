<script setup lang="ts">
interface Props {
	initialValue: number;
	allowFraction?: boolean;
	SVGclassName?: string;
	emptyClassName?: string;
	size?: number;
}

const props = withDefaults(defineProps<Props>(), {
	allowFraction: false,
	SVGclassName: "",
	emptyClassName: "",
	size: 20,
});

const stars = Array.from({ length: 5 }, (_, i) => i + 1);
</script>

<template>
	<div class="flex items-center">
		<svg
			v-for="star in stars"
			:key="star"
			:class="[
				props.SVGclassName,
				star <= props.initialValue ? 'text-yellow-400' : props.emptyClassName,
			]"
			:width="props.size"
			:height="props.size"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path
				d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			/>
		</svg>
	</div>
</template>
