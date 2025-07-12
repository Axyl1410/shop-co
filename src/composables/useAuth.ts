import { useAuthStore } from '@/stores/use-auth-store'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'

export function useAuth() {
	const authStore = useAuthStore()

	const login = async (credentials: LoginCredentials) => {
		return await authStore.login(credentials)
	}

	const register = async (credentials: RegisterCredentials) => {
		return await authStore.register(credentials)
	}

	const logout = () => {
		authStore.logout()
	}

	const updateProfile = async (updates: { ten?: string; email?: string }) => {
		return await authStore.updateProfile(updates)
	}

	const changePassword = async (oldPassword: string, newPassword: string) => {
		return await authStore.changePassword(oldPassword, newPassword)
	}

	return {
		user: authStore.currentUser,
		isAuthenticated: authStore.isAuthenticated,

		login,
		register,
		logout,
		updateProfile,
		changePassword,
	}
}
