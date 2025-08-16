<script setup lang="ts">
import { BadgeCheck, Bell, LogOut, Settings, User } from "lucide-vue-next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const router = useRouter();
const { isMobile } = useSidebar();

const handleLogout = () => {
	authStore.logout();
	router.push("/login");
};
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem v-if="user">
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar class="h-8 w-8 rounded-lg">
							<AvatarImage :src="user.avatar" :alt="user.username" />
							<AvatarFallback class="rounded-lg"> AD </AvatarFallback>
						</Avatar>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{{ user.username }}</span>
							<span class="truncate text-xs">Administrator</span>
						</div>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					:side="isMobile ? 'bottom' : 'right'"
					align="end"
					:side-offset="4"
				>
					<DropdownMenuLabel class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar class="h-8 w-8 rounded-lg">
								<AvatarImage :src="user.avatar" :alt="user.username" />
								<AvatarFallback class="rounded-lg"> AD </AvatarFallback>
							</Avatar>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{{ user.username }}</span>
								<span class="truncate text-xs">Administrator</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem @click="router.push('/admin/profile')">
							<User />
							Profile
						</DropdownMenuItem>
						<DropdownMenuItem @click="router.push('/admin/settings')">
							<Settings />
							Settings
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<BadgeCheck />
							Account
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Bell />
							Notifications
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem @click="handleLogout">
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
