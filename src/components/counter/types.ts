export type CounterOrderStatus = 'fila_preparo' | 'preparando' | 'pronto' | 'entregue' | 'cancelado'

export type CounterOrderItem = {
  qty: number
  nome: string
}

export type CounterOrder = {
  id: number
  senha: number
  nome: string
  mesa: number
  valor: number // centavos
  criadoEm: number
  status: CounterOrderStatus
  itens: CounterOrderItem[]
  prontoEm?: number | null
  entregueEm?: number | null
  chamadas?: number
  cooldownUntil?: number | null
  motivoDevolucao?: string
}

export type DashboardData = {
  dateLabel: string
  sub?: string
  faturado: number
  pedidos: number
  categorias: Record<string, number>
  ingredientes: { nome: string; qtd: number; unidade: string }[]
}
