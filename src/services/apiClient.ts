import axios, { AxiosError } from 'axios'

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    if (err.response?.status === 403) return 'Seu papel de usuário não tem permissão para essa ação.'
    const message = (err.response?.data as { message?: string | string[] } | undefined)?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && message.length > 0) return message[0]
  }
  return fallback
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})
