import { request } from './api'

export type UserRole = 'CLIENTE' | 'TECNICO' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  nombre: string
  telefono: string | null
  rol: UserRole
  avatarUrl: string | null
  perfilId?: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: AuthUser
    tokens: { accessToken: string; refreshToken: string }
  }
}

export interface MeResponse {
  success: boolean
  data: any
}

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export function saveSession(user: AuthUser, accessToken: string, refreshToken?: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
}

export function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveUser(user: AuthUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export async function login(email: string, password: string) {
  const body = { email, password }
  const res = await request<LoginResponse>({ method: 'POST', path: '/api/auth/login', body })
  const { user, tokens } = res.data
  saveSession(user, tokens.accessToken, tokens.refreshToken)
  return { user, tokens }
}

export async function refresh() {
  const token = getRefreshToken()
  if (!token) throw new Error('No hay refresh token')
  const res = await request<{ success: boolean; data: { accessToken: string; refreshToken: string } }>({
    method: 'POST',
    path: '/api/auth/refresh',
    body: { refreshToken: token },
  })
  localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken)
  return res.data
}

export async function me() {
  const token = getAccessToken()
  if (!token) throw new Error('No autenticado')
  const res = await request<MeResponse>({ method: 'GET', path: '/api/auth/me', token })
  return res.data
}

export function logout() {
  clearSession()
}

// Alias para compatibilidad
export const removeTokens = clearSession

export function getRedirectPathByRole(role: UserRole) {
  if (role === 'TECNICO') return '/tecnico'
  if (role === 'ADMIN') return '/admin'
  if (role === 'CLIENTE') return '/cliente'
  return '/'
}


