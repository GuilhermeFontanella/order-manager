import { api } from './apiClient'

export type TipoDescontoCupom = 'PERCENTUAL' | 'VALOR_FIXO'

export interface Cupom {
  id: string
  codigo: string
  tipoDesconto: TipoDescontoCupom
  valor: string
  validoAte: string
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface CupomInput {
  codigo: string
  tipoDesconto: TipoDescontoCupom
  valor: number
  validoAte: string
  ativo?: boolean
}

export async function listCupons(): Promise<Cupom[]> {
  const response = await api.get<Cupom[]>('/cupons')
  return response.data
}

export async function createCupom(payload: CupomInput): Promise<Cupom> {
  const response = await api.post<Cupom>('/cupons', payload)
  return response.data
}

export async function updateCupom(id: string, payload: Partial<CupomInput>): Promise<Cupom> {
  const response = await api.patch<Cupom>(`/cupons/${id}`, payload)
  return response.data
}

export async function deleteCupom(id: string): Promise<void> {
  await api.delete(`/cupons/${id}`)
}
