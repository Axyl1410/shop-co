import { useAuthStore } from "@/stores/use-auth-store";
import type { LoginCredentials, RegisterCredentials } from "@/types";

export function useAuth() {
	const authStore = useAuthStore();

	const login = async (credentials: LoginCredentials) => {
		return await authStore.login(credentials);
	};

	const register = async (credentials: RegisterCredentials) => {
		return await authStore.register(credentials);
	};

	const logout = () => {
		authStore.logout();
	};

	const refreshUser = async () => {
		return await authStore.refreshUser();
	};

	const initializeAuth = () => {
		authStore.initializeAuth();
	};

	return {
		user: authStore.currentUser,
		isAuthenticated: authStore.isAuthenticated,

		login,
		register,
		logout,
		initializeAuth,
		refreshUser,
	};
}
