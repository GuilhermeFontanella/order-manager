import { api } from './apiClient'

export type PeriodId = 'hoje' | 'ontem' | '7d' | '30d'
export type DashboardPeriod = 'HOJE' | 'ONTEM' | 'SETE_DIAS' | 'TRINTA_DIAS' | 'PERSONALIZADO'

export const PERIOD_LABEL: Record<PeriodId, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
}

export const PERIOD_OPTIONS: { id: PeriodId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
]

const PERIOD_API_VALUE: Record<PeriodId, DashboardPeriod> = {
  hoje: 'HOJE',
  ontem: 'ONTEM',
  '7d': 'SETE_DIAS',
  '30d': 'TRINTA_DIAS',
}

export interface DashboardResponse {
  periodo: DashboardPeriod
  kpis: {
    faturamento: string | number
    numeroPedidos: number
    ticketMedio: string | number
    bebidasVendidas: number
    bebidasAlcoolicasVendidas: number
  }
  serieTemporal: Array<{ inicio: string; faturamento: string | number; numeroPedidos: number }>
  vendasPorCategoria: Array<{ categoriaId: string | null; nome: string; quantidade: number; valor: string | number }>
  pratosMaisVendidos: Array<{ produtoId: string; nome: string; quantidade: number; valor: string | number }>
}

export async function getDashboard(period: PeriodId, customRange?: { dataInicio: string; dataFim: string }): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/dashboard', {
    params: { periodo: customRange ? 'PERSONALIZADO' : PERIOD_API_VALUE[period], limite: 10, ...customRange },
  })
  return response.data
}