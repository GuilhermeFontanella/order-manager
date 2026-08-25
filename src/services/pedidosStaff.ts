import { api } from './apiClient'
import type { MetodoPagamento, Pedido, StatusPedido } from './storefront'

export type ListarPedidosParams = {
  limit: number
  offset: number
  status?: StatusPedido[]
  metodoPagamento?: MetodoPagamento[]
  mesaId?: string[]
  busca?: string
  dataDe?: string
  dataAte?: string
}

export type PedidosPaginados = {
  data: Pedido[]
  total: number
  limit: number
  offset: number
}

function toCsv(values?: string[]): string | undefined {
  return values && values.length > 0 ? values.join(',') : undefined
}

export async function listPedidos(status?: StatusPedido): Promise<Pedido[]> {
  const response = await api.get<PedidosPaginados>('/pedidos', { params: status ? { status } : undefined })
  return response.data.data
}

export async function listPedidosPaginados(params: ListarPedidosParams): Promise<PedidosPaginados> {
  const response = await api.get<PedidosPaginados>('/pedidos', {
    params: {
      limit: params.limit,
      offset: params.offset,
      status: toCsv(params.status),
      metodoPagamento: toCsv(params.metodoPagamento),
      mesaId: toCsv(params.mesaId),
      busca: params.busca || undefined,
      dataDe: params.dataDe || undefined,
      dataAte: params.dataAte || undefined,
    },
  })
  return response.data
}

export async function updatePedidoStatus(id: string, status: StatusPedido): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/pedidos/${id}/status`, { status })
  return response.data
}
