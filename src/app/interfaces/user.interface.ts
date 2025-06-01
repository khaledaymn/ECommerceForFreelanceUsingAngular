export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "sales" | "support" | "customer"
  avatar?: string
  initials?: string
  lastLogin?: Date
  permissions?: string[]
  phone?: string
  company?: string
  position?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegistrationData {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  phone?: string
  company?: string
  acceptTerms: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
