export type OrderStatus = 'preparando' | 'pronto'

export type OrderItem = {
  qty: number
  nome: string
  opcoes: string[]
}

export type KitchenOrder = {
  id: string
  senha: number
  nome: string
  criadoEm: number
  status: OrderStatus
  itens: OrderItem[]
  obs?: string | null
  prontoEm?: number | null
}
