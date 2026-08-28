import { api } from './apiClient'

export type PapelUsuario = 'MANAGER' | 'HEAD_CHEF' | 'COUNTER' | 'KITCHEN'

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: PapelUsuario
  ativo: boolean
  mustChangePassword: boolean
}

export interface CriarUsuarioInput {
  nome: string
  email: string
  papel: PapelUsuario
}

export interface UsuarioCriado extends Usuario {
  senhaTemporaria: string
}

export async function listUsuarios(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>('/usuarios')
  return response.data
}

export async function createUsuario(payload: CriarUsuarioInput): Promise<UsuarioCriado> {
  const response = await api.post<UsuarioCriado>('/usuarios', payload)
  return response.data
}

export async function updateUsuario(id: string, payload: Partial<Pick<Usuario, 'papel' | 'ativo'>>): Promise<Usuario> {
  const response = await api.patch<Usuario>(`/usuarios/${id}`, payload)
  return response.data
}

export async function deleteUsuario(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`)
}