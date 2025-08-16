<script setup lang="ts">
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import { RouterLink, useRouter } from "vue-router";

interface Props {
	isAuthenticated: boolean;
	currentUser: User | null;
	logout: () => void;
}

const props = defineProps<Props>();

const router = useRouter();

const handleLogout = () => {
	props.logout();
	router.push("/");
};
</script>

<template>
	<DropdownMenuContent align="end">
		<template v-if="isAuthenticated">
			<div class="text-sm text-black/80">
				<DropdownMenuLabel>
					<div v-if="currentUser && (currentUser.firstName || currentUser.lastName)">
						Hi {{ (currentUser.firstName || "") + " " + (currentUser.lastName || "") }} !
					</div>
					<div v-else-if="currentUser && currentUser.username">
						{{ currentUser.username }}
					</div>
					<div v-else-if="currentUser && currentUser.email">
						{{ currentUser.email }}
					</div>
				</DropdownMenuLabel>
			</div>
			<DropdownMenuSeparator />
			<DropdownMenuItem as-child>
				<RouterLink to="/profile">Profile</RouterLink>
			</DropdownMenuItem>
			<DropdownMenuItem as-child>
				<RouterLink to="/cart">Your cart</RouterLink>
			</DropdownMenuItem>

			<DropdownMenuSeparator />
			<DropdownMenuItem @click="handleLogout">Sign out</DropdownMenuItem>
		</template>
		<template v-else>
			<DropdownMenuItem as-child>
				<RouterLink to="/login">Sign in</RouterLink>
			</DropdownMenuItem>
			<DropdownMenuItem as-child>
				<RouterLink to="/register">Sign up</RouterLink>
			</DropdownMenuItem>
		</template>
	</DropdownMenuContent>
</template>
