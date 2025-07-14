export interface User {
	id: number
	username: string
	email: string
	password: string
	firstName: string
	lastName: string
	phone: string
	avatar: string
	role: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterCredentials {
	username: string
	email: string
	password: string
	firstName: string
	lastName: string
	phone: string
	avatar: string
}
