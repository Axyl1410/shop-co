export interface User {
  id: number
  ten: string
  email: string
  matkhau: string
}

export interface LoginCredentials {
  email: string
  matkhau: string
}

export interface RegisterCredentials {
  ten: string
  email: string
  matkhau: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  expiresAt: number | null
}

export interface AuthResponse {
  user: User
  token: string
  expiresIn: number
}
