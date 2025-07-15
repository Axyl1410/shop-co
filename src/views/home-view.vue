<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hook'
import { toast } from 'vue-sonner'

const { users, isError, error, isLoading } = useUsers()

const handleClick = () => {
	toast('test')
}
</script>

<template>
	<main>
		<div v-if="isError" class="text-red-500">{{ error }}</div>
		<div v-if="isLoading" class="text-blue-500">Loading...</div>
		<div v-if="users" class="mt-4">
			<div v-for="user in users" :key="user.id" class="rounded border p-2">
				<div>{{ user.username }} ({{ user.firstName }} {{ user.lastName }})</div>
				<div>{{ user.email }}</div>
			</div>
		</div>
	</main>
	<Button @click="handleClick">Click me</Button>
</template>
