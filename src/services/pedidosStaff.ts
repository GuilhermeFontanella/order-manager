import { api } from './apiClient'
import type { Pedido, StatusPedido } from './storefront'

export async function listPedidos(status?: StatusPedido): Promise<Pedido[]> {
  const response = await api.get<Pedido[]>('/pedidos', { params: status ? { status } : undefined })
  return response.data
}

export async function updatePedidoStatus(id: string, status: StatusPedido): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/pedidos/${id}/status`, { status })
  return response.data
}
