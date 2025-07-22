import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

export function requireAuth(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	if (!isAuthenticated) {
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
	if (isAuthenticated) {
		next({ name: "home" });
	} else {
		next();
	}
}
