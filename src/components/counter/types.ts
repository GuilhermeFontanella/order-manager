export type CounterOrderStatus = 'AGUARDANDO_PAGAMENTO' | 'PREPARANDO' | 'PRONTO' | 'RETIRADO' | 'CANCELADO'

export type CounterOrderItem = {
  qty: number
  nome: string
  produtoId: string
}

export type CounterOrder = {
  id: string
  senha: number
  nome: string
  origem: string
  valor: number // centavos
  criadoEm: number
  status: CounterOrderStatus
  itens: CounterOrderItem[]
  prontoEm?: number | null
  entregueEm?: number | null
  chamadas?: number
  cooldownUntil?: number | null
}

export type DashboardData = {
  dateLabel: string
  sub?: string
  faturado: number
  pedidos: number
  categorias: Record<string, number>
  ingredientes: { nome: string; qtd: number; unidade: string }[]
}
