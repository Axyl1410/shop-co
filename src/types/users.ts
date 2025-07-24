export interface User {
	id: number;
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	avatar: string;
	role: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export type LoginCredentials = Pick<User, "email" | "password">;

export type RegisterCredentials = Omit<
	User,
	"id" | "createdAt" | "updatedAt" | "isActive" | "role"
>;
