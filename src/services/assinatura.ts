import { api } from './apiClient'

export type Periodicidade = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'

export interface PeriodicidadeOpcao {
  periodicidade: Periodicidade
  meses: number
  descontoPercentual: number
  precoTotal: number
}

export interface AssinaturaPlano {
  id: string
  nome: string
  descricao: string | null
  features: string[]
  limiteMesas: number | null
  limiteUsuarios: number | null
  limiteProdutos: number | null
  preco: string
  periodicidade: string
  opcoesPeriodicidade: PeriodicidadeOpcao[]
}

export interface AssinaturaUso {
  mesasAtivas: number
  usuarios: number
  produtosCadastrados: number
}

export interface AssinaturaInfo {
  status: string | null
  restaurantStatus: string
  currentPlan: AssinaturaPlano | null
  renewalDate: string | null
  isTrial: boolean
  availablePlans: AssinaturaPlano[]
  uso: AssinaturaUso
}

export async function getAssinatura(): Promise<AssinaturaInfo> {
  const response = await api.get<AssinaturaInfo>('/restaurante/assinatura')
  return response.data
}

export async function criarCheckoutAssinatura(planId: string, periodicidade: Periodicidade): Promise<{ checkoutUrl: string }> {
  const response = await api.post<{ checkoutUrl: string }>('/restaurante/assinatura/checkout', { planId, periodicidade })
  return response.data
}
