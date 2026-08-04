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
