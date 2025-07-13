import { ServerAxiosConfig } from '@/constant/axios-config'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'
import axios from 'axios'

const API_BASE_URL = ServerAxiosConfig.baseURL

export class AuthService {
	static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
		try {
			const response = await axios.get(`${API_BASE_URL}users`)
			const users: User[] = response.data

			const user = users.find(
				(u) => u.email === credentials.email && u.matkhau === credentials.matkhau,
			)

			if (!user) {
				throw new Error('Email hoặc mật khẩu không đúng')
			}

			const token = `token_${user.id}_${Date.now()}`

			return { user, token }
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error('Lỗi kết nối server')
			}
			throw error
		}
	}

	static async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
		try {
			const response = await axios.get(`${API_BASE_URL}/users`)
			const users: User[] = response.data

			const existingUser = users.find((u) => u.email === credentials.email)
			if (existingUser) {
				throw new Error('Email đã tồn tại')
			}

			// Create new user
			const newUser: Omit<User, 'id'> = {
				ten: credentials.ten,
				email: credentials.email,
				matkhau: credentials.matkhau,
			}

			const createResponse = await axios.post(`${API_BASE_URL}/users`, newUser)
			const user: User = createResponse.data

			// Generate token
			const token = `token_${user.id}_${Date.now()}`

			return { user, token }
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error('Lỗi kết nối server')
			}
			throw error
		}
	}

	static async getCurrentUser(token: string): Promise<User | null> {
		try {
			const tokenParts = token.split('_')
			if (tokenParts.length < 2) return null

			const userId = parseInt(tokenParts[1])
			const response = await axios.get(`${API_BASE_URL}/users/${userId}`)
			return response.data
		} catch {
			return null
		}
	}

	static async updateProfile(userId: number, updates: Partial<User>): Promise<User> {
		try {
			const response = await axios.patch(`${API_BASE_URL}/users/${userId}`, updates)
			return response.data
		} catch {
			throw new Error('Không thể cập nhật thông tin')
		}
	}

	static async changePassword(
		userId: number,
		oldPassword: string,
		newPassword: string,
	): Promise<void> {
		try {
			const userResponse = await axios.get(`${API_BASE_URL}/users/${userId}`)
			const user: User = userResponse.data

			if (user.matkhau !== oldPassword) {
				throw new Error('Mật khẩu cũ không đúng')
			}

			await axios.patch(`${API_BASE_URL}/users/${userId}`, {
				matkhau: newPassword,
			})
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error('Lỗi kết nối server')
			}
			throw error
		}
	}
}
