import apiClient from './api'
import type { TokenResponse, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(token: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      token,
    })
    return response.data
  },

  // Token management
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  },

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },

  // Store user data in localStorage
  setCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user))
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user')
    return userStr ? JSON.parse(userStr) : null
  },

  clearCurrentUser(): void {
    localStorage.removeItem('current_user')
  },
}
