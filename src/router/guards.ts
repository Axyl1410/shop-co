import { useAuthStore } from "@/stores/use-auth-store";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const authStore = useAuthStore();

export function requireAuth(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	if (!authStore.isAuthenticated) {
		next({ name: "login", query: { redirect: to.fullPath } });
	} else {
		next();
	}
}

export function requireGuest(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	if (authStore.isAuthenticated) {
		next({ name: "home" });
	} else {
		next();
	}
}
