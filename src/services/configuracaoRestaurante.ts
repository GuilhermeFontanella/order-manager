import { api } from './apiClient'
import type { ConfiguracaoRestaurante, HorarioDia } from './storefront'

export type UpdateConfiguracaoRestauranteInput = Partial<{
  nome: string
  descricao: string
  historia: string
  horarios: HorarioDia[]
}>

export async function updateConfiguracaoRestaurante(
  payload: UpdateConfiguracaoRestauranteInput
): Promise<ConfiguracaoRestaurante> {
  const response = await api.patch<ConfiguracaoRestaurante>('/restaurante', payload)
  return response.data
}
