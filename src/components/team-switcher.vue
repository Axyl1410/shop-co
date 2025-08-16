<script setup lang="ts">
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { type Component } from "vue";

const props = defineProps<{
	teams: {
		name: string;
		logo: Component;
		plan: string;
	}[];
}>();

const activeTeam = props.teams[0];
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<SidebarMenuButton size="lg" class="cursor-default">
				<div
					class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
				>
					<component :is="activeTeam.logo" class="size-4" />
				</div>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-medium">
						{{ activeTeam.name }}
					</span>
					<span class="truncate text-xs">{{ activeTeam.plan }}</span>
				</div>
			</SidebarMenuButton>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
