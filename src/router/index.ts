import HomeView from "@/views/home-view.vue";
import { createRouter, createWebHistory } from "vue-router";
import { requireAdmin, requireAuth } from "./guards";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			component: () => import("@/views/layout/index-layout.vue"),
			children: [
				{
					path: "",
					name: "home",
					component: HomeView,
				},
				{
					path: "about",
					name: "about",
					component: () => import("@/views/about-view.vue"),
				},
				{
					path: "shop/product/:id",
					name: "product-detail",
					component: () => import("@/views/product-detail.vue"),
				},
				{
					path: "shop",
					name: "shop",
					component: () => import("@/views/shop-view.vue"),
				},
				{
					path: "profile",
					name: "profile",
					component: () => import("@/views/profile-view.vue"),
					beforeEnter: requireAuth,
				},
				{
					path: "cart",
					name: "cart",
					component: () => import("@/views/cart-view.vue"),
					beforeEnter: requireAuth,
				},
			],
		},

		{
			path: "/",
			name: "auth",
			component: () => import("@/views/layout/auth-layout.vue"),
			children: [
				{
					path: "login",
					name: "login",
					component: () => import("@/views/login-view.vue"),
				},
				{
					path: "register",
					name: "register",
					component: () => import("@/views/register-view.vue"),
				},
			],
		},

		{
			path: "/admin",
			component: () => import("@/views/layout/admin-layout.vue"),
			beforeEnter: requireAdmin,
			children: [
				{
					path: "",
					name: "admin-dashboard",
					component: () => import("@/views/admin/dashboard-view.vue"),
				},
				{
					path: "products",
					name: "admin-products",
					component: () => import("@/views/admin/products-view.vue"),
				},
				{
					path: "orders",
					name: "admin-orders",
					component: () => import("@/views/admin/orders-view.vue"),
				},
				{
					path: "users",
					name: "admin-users",
					component: () => import("@/views/admin/users-view.vue"),
				},
				{
					path: "settings",
					name: "admin-settings",
					component: () => import("@/views/admin/settings-view.vue"),
				},
			],
		},

		{
			path: "/:pathMatch(.*)*",
			name: "not-found",
			component: () => import("@/views/not-found-view.vue"),
		},
	],
});

export default router;
