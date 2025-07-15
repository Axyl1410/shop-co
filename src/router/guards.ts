import { useAuthStore } from '@/stores/use-auth-store'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export function requireAuth(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	const authStore = useAuthStore()

	if (!authStore.isAuthenticated) {
		next({ name: 'login', query: { redirect: to.fullPath } })
	} else {
		next()
	}
}

export function requireGuest(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
) {
	const authStore = useAuthStore()

	if (authStore.isAuthenticated) {
		next({ name: 'home' })
	} else {
		next()
	}
}
