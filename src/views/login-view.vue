<script setup lang="ts">
import LoginForm from "@/components/layout/login-form.vue";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const { isAuthenticated } = storeToRefs(authStore);

const isOpen = ref<boolean>(false);

if (isAuthenticated) {
	isOpen.value = true;
} else {
	isOpen.value = false;
}

const handleOpenChange = (open: boolean) => {
	if (isAuthenticated) {
		isOpen.value = open;
	}
};

const handleLogout = () => {
	authStore.logout();
	isOpen.value = false;
};
</script>

<template>
	<div class="flex flex-col items-center justify-center bg-white p-6 md:p-10">
		<div class="w-full max-w-sm md:max-w-3xl">
			<LoginForm />
		</div>
	</div>

	<Dialog :open="isOpen" @open-change="handleOpenChange">
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Login</DialogTitle>
				<DialogDescription> You are already logged in, do you want to logout? </DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<div class="flex gap-2">
					<Button @click="router.push('/')">Return home</Button>
					<Button variant="outline" @click="handleLogout">Logout</Button>
				</div>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
