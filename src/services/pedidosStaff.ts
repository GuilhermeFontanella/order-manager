import { api } from './apiClient'
import type { MetodoPagamento, Pedido, StatusPedido } from './storefront'

export type ListarPedidosParams = {
  limit?: number
  offset?: number
  status?: StatusPedido[]
  metodoPagamento?: MetodoPagamento[]
  mesaId?: string[]
  busca?: string
  dataDe?: string
  dataAte?: string
}

export type ListarPedidosResult = {
  data: Pedido[]
  total: number
  limit?: number
  offset?: number
}

function toQueryParams(params: ListarPedidosParams) {
  const { status, metodoPagamento, mesaId, busca, dataDe, dataAte, limit, offset } = params
  return {
    status: status && status.length > 0 ? status.join(',') : undefined,
    metodoPagamento: metodoPagamento && metodoPagamento.length > 0 ? metodoPagamento.join(',') : undefined,
    mesaId: mesaId && mesaId.length > 0 ? mesaId.join(',') : undefined,
    busca: busca?.trim() || undefined,
    dataDe: dataDe || undefined,
    dataAte: dataAte || undefined,
    limit,
    offset,
  }
}

export async function listPedidos(status?: StatusPedido): Promise<Pedido[]> {
  const response = await api.get<ListarPedidosResult>('/pedidos', {
    params: toQueryParams(status ? { status: [status] } : {}),
  })
  return response.data.data
}

export async function listPedidosPaginado(params: ListarPedidosParams): Promise<ListarPedidosResult> {
  const response = await api.get<ListarPedidosResult>('/pedidos', { params: toQueryParams(params) })
  return response.data
}

export async function updatePedidoStatus(id: string, status: StatusPedido): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/pedidos/${id}/status`, { status })
  return response.data
}

export type StatusPedidoManual = 'RETIRADO' | 'CANCELADO'

export async function updatePedidoStatusManual(id: string, status: StatusPedidoManual, motivo: string): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/pedidos/${id}/status-manual`, { status, motivo })
  return response.data
}
