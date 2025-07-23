<script setup lang="ts">
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

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const isOpen = ref<boolean>(false);

if (isAuthenticated.value) {
	isOpen.value = true;
} else {
	isOpen.value = false;
}

const handleOpenChange = (open: boolean) => {
	if (isAuthenticated.value) {
		isOpen.value = open;
	}
};

const handleLogout = () => {
	authStore.logout();
	isOpen.value = false;
};
</script>

<template>
	<RouterView />

	<Dialog :open="isOpen" @open-change="handleOpenChange">
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Login</DialogTitle>
				<DialogDescription> You are already logged in, do you want to logout? </DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<div class="flex gap-2">
					<Button variant="outline" as-child>
						<RouterLink to="/">Return home</RouterLink>
					</Button>
					<Button @click="handleLogout">Logout</Button>
				</div>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
