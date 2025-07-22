import { useAuthStore } from "@/stores/use-auth-store";
import { storeToRefs } from "pinia";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export function requireAuth(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	const authStore = useAuthStore();
	const { isAuthenticated } = storeToRefs(authStore);
	if (!isAuthenticated.value) {
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
	const authStore = useAuthStore();
	const { isAuthenticated } = storeToRefs(authStore);
	if (isAuthenticated.value) {
		next({ name: "home" });
	} else {
		next();
	}
}
