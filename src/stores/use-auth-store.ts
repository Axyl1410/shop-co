import { AuthService } from '@/services/auth-service'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore(
	'auth',
	() => {
		const user = ref<User | null>(null)
		const token = ref<string | null>(null)
		const expiresAt = ref<number | null>(null)

		const isAuthenticated = computed(() => {
			if (!user.value || !token.value || !expiresAt.value) {
				return false
			}

			const now = Date.now()
			if (now >= expiresAt.value) {
				logout()
				return false
			}

			return true
		})

		const currentUser = computed(() => user.value)

		async function login(credentials: LoginCredentials) {
			try {
				const { user: userData, token: userToken } = await AuthService.login(credentials)

				const expirationTime = Date.now() + 24 * 60 * 60 * 1000

				user.value = userData
				token.value = userToken
				expiresAt.value = expirationTime

				return { success: true }
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
				}
			}
		}

		async function register(credentials: RegisterCredentials) {
			try {
				const { user: userData, token: userToken } = await AuthService.register(credentials)

				const expirationTime = Date.now() + 24 * 60 * 60 * 1000

				user.value = userData
				token.value = userToken
				expiresAt.value = expirationTime

				return { success: true }
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Đăng ký thất bại',
				}
			}
		}

		function logout() {
			user.value = null
			token.value = null
			expiresAt.value = null
		}

		async function refreshUser() {
			if (!token.value) return false

			try {
				const userData = await AuthService.getCurrentUser(token.value)
				if (userData) {
					user.value = userData
					return true
				}
				return false
			} catch {
				logout()
				return false
			}
		}

		async function updateProfile(updates: Partial<User>) {
			if (!user.value) throw new Error('Chưa đăng nhập')

			try {
				const updatedUser = await AuthService.updateProfile(user.value.id, updates)
				user.value = updatedUser
				return { success: true }
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Cập nhật thất bại',
				}
			}
		}

		async function changePassword(oldPassword: string, newPassword: string) {
			if (!user.value) throw new Error('Chưa đăng nhập')

			try {
				await AuthService.changePassword(user.value.id, oldPassword, newPassword)
				return { success: true }
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại',
				}
			}
		}

		function initializeAuth() {
			if (user.value && token.value && expiresAt.value) {
				const now = Date.now()
				if (now >= expiresAt.value) {
					logout()
				}
			}
		}

		return {
			user,
			token,
			expiresAt,

			isAuthenticated,
			currentUser,

			login,
			register,
			logout,
			refreshUser,
			updateProfile,
			changePassword,
			initializeAuth,
		}
	},
	{
		persist: true,
	},
)
