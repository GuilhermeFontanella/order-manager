import { api } from './apiClient'
import type { Category } from '../data/menu'
import { normalizeCategories } from './normalize'

export type Mesa = {
  id: string
  numero: number
  qrCodeToken: string
  ativa: boolean
}

export type MetodoPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'

export type StatusPedido = 'AGUARDANDO_PAGAMENTO' | 'PREPARANDO' | 'PRONTO' | 'RETIRADO' | 'CANCELADO'

export type OpcaoSelecionada = {
  grupoOpcaoNome: string
  opcaoNome: string
  precoAdicional?: number
}

export type CreatePedidoItemInput = {
  produtoId: string
  quantidade: number
  observacao?: string
  opcoesSelecionadas?: OpcaoSelecionada[]
}

export type CreatePedidoPayload = {
  mesaQrCodeToken: string
  nomeCliente: string
  emailCliente?: string
  pagamento: { metodo: MetodoPagamento }
  itens: CreatePedidoItemInput[]
}

export type Pedido = {
  id: string
  mesaId: string
  nomeCliente: string
  emailCliente: string | null
  numeroSequencial: number
  status: StatusPedido
  valorTotal: string
  criadoEm: string
  pagoEm: string | null
  prontoEm: string | null
  retiradoEm: string | null
  itens: Array<{
    id: string
    produtoId: string
    nomeProduto: string
    precoUnitario: string
    quantidade: number
    observacao: string | null
    subtotal: string
    opcoesSelecionadas: OpcaoSelecionada[]
  }>
  pagamento: {
    id: string
    valor: string
    metodo: MetodoPagamento
    status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO'
    gatewayTransactionId: string | null
    confirmadoEm: string | null
  } | null
  mesa: Mesa
}

export async function getMesaCardapio(tenantSlug: string, qrCodeToken: string): Promise<{ mesa: Mesa; cardapio: Category[] }> {
  const response = await api.get<{ mesa: Mesa; cardapio: unknown }>(`/r/${tenantSlug}/mesa/${qrCodeToken}`)
  return {
    mesa: response.data.mesa,
    cardapio: normalizeCategories(response.data.cardapio),
  }
}

export type PedidoCriado = Pedido & { confirmacaoToken: string }

export async function createPedido(tenantSlug: string, payload: CreatePedidoPayload): Promise<PedidoCriado> {
  const response = await api.post<PedidoCriado>(`/r/${tenantSlug}/pedidos`, payload)
  return response.data
}

export async function confirmarPagamento(
  tenantSlug: string,
  pedidoId: string,
  confirmacaoToken: string
): Promise<{ pagamento: Pedido['pagamento']; pedido: Pedido }> {
  const response = await api.patch<{ pagamento: Pedido['pagamento']; pedido: Pedido }>(
    `/r/${tenantSlug}/pedidos/${pedidoId}/confirmar-pagamento`,
    { confirmacaoToken }
  )
  return response.data
}
