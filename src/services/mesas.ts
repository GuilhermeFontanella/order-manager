import { api } from './apiClient'

export type Mesa = {
  id: string
  numero: number
  qrCodeToken: string
  ativa: boolean
  criadoEm: string
  atualizadoEm: string
}

export type MesaInput = {
  numero: number
  ativa?: boolean
}

export async function listMesas(): Promise<Mesa[]> {
  const response = await api.get<Mesa[]>('/mesas')
  return response.data
}

export async function createMesa(payload: MesaInput): Promise<Mesa> {
  const response = await api.post<Mesa>('/mesas', payload)
  return response.data
}

export async function updateMesa(id: string, payload: Partial<MesaInput>): Promise<Mesa> {
  const response = await api.patch<Mesa>(`/mesas/${id}`, payload)
  return response.data
}

export async function deleteMesa(id: string): Promise<void> {
  await api.delete(`/mesas/${id}`)
}
