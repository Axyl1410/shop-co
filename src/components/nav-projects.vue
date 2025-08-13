<script setup lang="ts">
import { type LucideIcon } from "lucide-vue-next";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "vue-router";

const router = useRouter();

defineProps<{
	projects: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
}>();

const navigateTo = (url: string) => {
	if (url !== "#") {
		router.push(url);
	}
};
</script>

<template>
	<SidebarGroup class="group-data-[collapsible=icon]:hidden">
		<SidebarGroupLabel>Quick Access</SidebarGroupLabel>
		<SidebarMenu>
			<SidebarMenuItem v-for="item in projects" :key="item.name">
				<SidebarMenuButton 
					:tooltip="item.name"
					@click="navigateTo(item.url)"
				>
					<component :is="item.icon" />
					<span>{{ item.name }}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroup>
</template>
