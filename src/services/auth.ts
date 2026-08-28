import { api } from './apiClient'

interface LoginPayload {
  email: string
  senha: string
}

export interface AuthUser {
  id: string
  nome: string
  email: string
  papel: 'MANAGER' | 'HEAD_CHEF' | 'COUNTER' | 'KITCHEN'
  mustChangePassword?: boolean
  tenant: { id: string; slug: string; nome: string }
}

interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export async function loginService(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/auth/me')
  return response.data
}

export async function changePassword(payload: { senhaAtual: string; novaSenha: string }): Promise<void> {
  await api.post('/auth/change-password', payload)
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPassword(payload: { token: string; novaSenha: string }): Promise<void> {
  await api.post('/auth/reset-password', payload)
}
