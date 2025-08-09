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
import { computed } from "vue";

interface Props {
	open: boolean;
	redirectUrl?: string;
}

interface Emits {
	(e: "update:open", value: boolean): void;
	(e: "navigate", path: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const isAdmin = computed(() => user.value?.role === "admin");

const handleNavigate = (path: string) => {
	emit("update:open", false);
	emit("navigate", path);
};

const handleClose = () => {
	emit("update:open", false);
	emit("navigate", "/");
};

const handleRedirect = () => {
	if (props.redirectUrl) {
		handleNavigate(props.redirectUrl);
	} else {
		handleNavigate("/");
	}
};
</script>

<template>
	<Dialog :open="open" @update:open="handleClose">
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Login Successful!</DialogTitle>
				<DialogDescription>
					Welcome back, {{ user?.firstName || "User" }}! Where would you like to go?
				</DialogDescription>
			</DialogHeader>

			<div class="flex flex-col gap-3 py-4">
				<Button
					v-if="redirectUrl"
					@click="handleRedirect"
					class="w-full justify-start"
					variant="outline"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Continue to {{ redirectUrl === "/" ? "Home" : "Previous Page" }}
				</Button>

				<Button @click="handleNavigate('/shop')" class="w-full justify-start" variant="outline">
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
						/>
					</svg>
					Go to Shop
				</Button>

				<Button
					v-if="isAdmin"
					@click="handleNavigate('/admin/')"
					class="w-full justify-start"
					variant="outline"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					Admin Dashboard
				</Button>

				<Button @click="handleNavigate('/')" class="w-full justify-start" variant="outline">
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					Go to Home
				</Button>
			</div>

			<DialogFooter>
				<Button variant="outline" @click="handleClose">Cancel</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
