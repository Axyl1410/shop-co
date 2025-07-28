import HomeView from "@/views/home-view.vue";
import { createRouter, createWebHistory } from "vue-router";
import { requireAuth } from "./guards";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/about",
			name: "about",
			component: () => import("@/views/about-view.vue"),
		},
		{
			path: "/shop/product/:id",
			name: "product-detail",
			component: () => import("@/views/product-detail.vue"),
		},
		{
			path: "/profile",
			name: "profile",
			component: () => import("@/views/profile-view.vue"),
			beforeEnter: requireAuth,
		},
		{
			path: "/shop",
			name: "shop",
			component: () => import("@/views/shop-view.vue"),
		},
		{
			path: "/:pathMatch(.*)*",
			name: "not-found",
			component: () => import("@/views/not-found-view.vue"),
		},
		{
			path: "/",
			name: "auth",
			component: () => import("@/views/layout/auth-layout.vue"),
			children: [
				{ path: "login", name: "login", component: () => import("@/views/login-view.vue") },
				{
					path: "register",
					name: "register",
					component: () => import("@/views/register-view.vue"),
				},
			],
		},
	],
});

export default router;
