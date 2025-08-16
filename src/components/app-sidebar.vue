<script setup lang="ts">
import NavMain from "@/components/nav-main.vue";
import NavProjects from "@/components/nav-projects.vue";
import NavUser from "@/components/nav-user.vue";
import TeamSwitcher from "@/components/team-switcher.vue";
import type { SidebarProps } from "@/components/ui/sidebar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	BarChart3,
	Package,
	ShoppingCart,
	Users,
	Settings,
	Star,
	Home,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import { computed } from "vue";

const props = withDefaults(defineProps<SidebarProps>(), {
	collapsible: "icon",
});

const route = useRoute();

// Admin navigation data based on router
const adminNavData = {
	user: {
		name: "Admin",
		email: "admin@shop-co.com",
		avatar: "/avatars/admin.jpg",
	},
	teams: [
		{
			name: "Shop Co",
			logo: Package,
			plan: "Admin",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/admin",
			icon: Home,
			isActive: route.name === "admin-dashboard",
		},
		{
			title: "Products",
			url: "/admin/products",
			icon: Package,
			isActive: route.name === "admin-products",
		},
		{
			title: "Orders",
			url: "/admin/orders",
			icon: ShoppingCart,
			isActive: route.name === "admin-orders",
		},
		{
			title: "Users",
			url: "/admin/users",
			icon: Users,
			isActive: route.name === "admin-users",
		},
		{
			title: "Reviews",
			url: "/admin/review",
			icon: Star,
			isActive: route.name === "admin-review",
		},
		{
			title: "Analytics",
			url: "#",
			icon: BarChart3,
			isActive: false,
		},
		{
			title: "Settings",
			url: "/admin/settings",
			icon: Settings,
			isActive: route.name === "admin-settings",
		},
	],
	projects: [
		{
			name: "Product Management",
			url: "/admin/products",
			icon: Package,
		},
		{
			name: "Order Management",
			url: "/admin/orders",
			icon: ShoppingCart,
		},
		{
			name: "User Management",
			url: "/admin/users",
			icon: Users,
		},
	],
};

// Update active states when route changes
const updateActiveStates = computed(() => {
	return adminNavData.navMain.map(item => ({
		...item,
		isActive: route.path === item.url
	}));
});
</script>

<template>
	<Sidebar v-bind="props" class="no-scrollbar">
		<SidebarHeader>
			<TeamSwitcher :teams="adminNavData.teams" />
		</SidebarHeader>

		<SidebarContent>
			<NavMain :items="updateActiveStates" />
			<NavProjects :projects="adminNavData.projects" />
		</SidebarContent>
		<SidebarFooter>
			<NavUser :user="adminNavData.user" />
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
