import { ServerAxiosConfig } from "@/constant";
import type { LoginCredentials, RegisterCredentials, User } from "@/types/users";
import axios from "axios";

const API_BASE_URL = ServerAxiosConfig.baseURL;

export class AuthService {
	static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
		try {
			const response = await axios.get(`${API_BASE_URL}/users`);
			const users: User[] = response.data;

			const user = users.find(
				(u) => u.email === credentials.email && u.password === credentials.password,
			);

			if (!user) {
				throw new Error("Email hoặc mật khẩu không đúng");
			}

			const token = `token_${user.id}_${Date.now()}`;

			return { user, token };
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error("Lỗi kết nối server");
			}
			throw error;
		}
	}

	static async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
		try {
			const response = await axios.get(`${API_BASE_URL}/users`);
			const users: User[] = response.data;

			const existingUser = users.find((u) => u.email === credentials.email);
			if (existingUser) {
				throw new Error("Email đã tồn tại");
			}

			const newUser: Omit<User, "id"> = {
				username: credentials.username,
				email: credentials.email,
				password: credentials.password,
				firstName: credentials.firstName,
				lastName: credentials.lastName,
				phone: credentials.phone,
				avatar: credentials.avatar,
				role: "customer",
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const createResponse = await axios.post(`${API_BASE_URL}/users`, newUser);
			const user: User = createResponse.data;

			const token = `token_${user.id}_${Date.now()}`;

			return { user, token };
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error("Lỗi kết nối server");
			}
			throw error;
		}
	}

	static async getCurrentUser(token: string): Promise<User | null> {
		try {
			const tokenParts = token.split("_");
			if (tokenParts.length < 2) {
				console.log("Invalid token format:", token);
				return null;
			}

			const userId = tokenParts[1]; // Keep as string, don't parse to int
			console.log("Extracted userId from token:", userId);
			
			const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
			console.log("User API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error getting current user:", error);
			if (axios.isAxiosError(error)) {
				console.error("Axios error status:", error.response?.status);
				console.error("Axios error data:", error.response?.data);
			}
			return null;
		}
	}
}
