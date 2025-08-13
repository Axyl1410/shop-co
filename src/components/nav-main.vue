<script setup lang="ts">
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

defineProps<{
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
	}[];
}>();

const navigateTo = (url: string) => {
	if (url !== "#") {
		router.push(url);
	}
};
</script>

<template>
	<SidebarGroup>
		<SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
		<SidebarMenu>
			<SidebarMenuItem v-for="item in items" :key="item.title">
				<SidebarMenuButton 
					:tooltip="item.title"
					:class="{ 'bg-accent': item.isActive }"
					@click="navigateTo(item.url)"
				>
					<component :is="item.icon" v-if="item.icon" />
					<span>{{ item.title }}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroup>
</template>
