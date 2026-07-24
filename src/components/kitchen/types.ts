export type OrderStatus = 'fila_preparo' | 'preparando' | 'pronto'

export type OrderItem = {
  qty: number
  nome: string
  opcoes: string[]
}

export type KitchenOrder = {
  id: number
  senha: number
  nome: string
  criadoEm: number
  status: OrderStatus
  itens: OrderItem[]
  obs?: string | null
  prontoEm?: number | null
}
