import { api } from "./apiClient";
import type { Category } from "../data/menu";
import { normalizeCategories } from "./normalize";

export type Mesa = {
  id: string;
  numero: number;
  qrCodeToken: string;
  ativa: boolean;
};

export type MetodoPagamento = "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "GOOGLE_PAY" | "APPLE_PAY";

export type StatusPedido =
  "AGUARDANDO_PAGAMENTO" | "PREPARANDO" | "PRONTO" | "RETIRADO" | "CANCELADO";

export type OpcaoSelecionada = {
  grupoOpcaoNome: string;
  opcaoNome: string;
  precoAdicional?: number;
};

export type CreatePedidoItemInput = {
  produtoId: string;
  quantidade: number;
  observacao?: string;
  opcoesSelecionadas?: OpcaoSelecionada[];
};

export type TipoEntrega = "RETIRADA_BALCAO" | "TAKE_AWAY" | "DELIVERY";

export const TIPO_ENTREGA_LABEL: Record<TipoEntrega, string> = {
  RETIRADA_BALCAO: "Retirada no balcão",
  TAKE_AWAY: "Take away",
  DELIVERY: "Delivery",
};

export type EnderecoEntrega = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
};

export type CreatePedidoPayload = {
  mesaQrCodeToken?: string;
  nomeCliente: string;
  emailCliente?: string;
  tipoEntrega: TipoEntrega;
  endereco?: EnderecoEntrega;
  pagamento: {
    metodo: MetodoPagamento;
    cardToken?: string;
    paymentMethodId?: string;
    installments?: number;
  };
  itens: CreatePedidoItemInput[];
  codigoCupom?: string;
};

export type TipoDescontoCupom = "PERCENTUAL" | "VALOR_FIXO";

export type CupomAplicado = {
  cupomId: string;
  codigo: string;
  tipoDesconto: TipoDescontoCupom;
  valor: string;
  subtotal: string;
  valorDesconto: string;
  valorFinal: string;
};

export type Pedido = {
  id: string;
  mesaId: string | null;
  nomeCliente: string;
  emailCliente: string | null;
  numeroSequencial: number;
  status: StatusPedido;
  valorTotal: string;
  valorDesconto: string;
  tipoEntrega: TipoEntrega;
  enderecoCep: string | null;
  enderecoRua: string | null;
  enderecoNumero: string | null;
  enderecoBairro: string | null;
  enderecoCidade: string | null;
  cupom: { id: string; codigo: string; tipoDesconto: TipoDescontoCupom; valor: string } | null;
  criadoEm: string;
  pagoEm: string | null;
  prontoEm: string | null;
  retiradoEm: string | null;
  alteracaoManual: { usuario: string; data: string; motivo: string } | null;
  itens: Array<{
    id: string;
    produtoId: string;
    nomeProduto: string;
    precoUnitario: string;
    quantidade: number;
    observacao: string | null;
    subtotal: string;
    opcoesSelecionadas: OpcaoSelecionada[];
  }>;
  pagamento: {
    id: string;
    valor: string;
    metodo: MetodoPagamento;
    status: "PENDENTE" | "APROVADO" | "RECUSADO" | "ESTORNADO";
    gatewayTransactionId: string | null;
    pixQrCode: string | null;
    pixQrCodeBase64: string | null;
    confirmadoEm: string | null;
  } | null;
  mesa: Mesa | null;
};

export async function getMesaCardapio(
  tenantSlug: string,
  qrCodeToken: string,
): Promise<{ mesa: Mesa; cardapio: Category[] }> {
  const response = await api.get<{ mesa: Mesa; cardapio: unknown }>(
    `/r/${tenantSlug}/mesa/${qrCodeToken}`,
  );
  return {
    mesa: response.data.mesa,
    cardapio: normalizeCategories(response.data.cardapio),
  };
}

export type CategoriaStorefront = {
  id: string;
  nome: string;
  tipo: "COMIDA" | "BEBIDA" | "BEBIDA_ALCOOLICA";
  ativa: boolean;
};

export async function getMesaCategorias(
  tenantSlug: string,
): Promise<CategoriaStorefront[]> {
  const response = await api.get<CategoriaStorefront[]>(
    `/r/${tenantSlug}/categorias`,
  );
  return response.data;
}

export type BuscarProdutosFiltros = {
  search?: string;
  categoriaId?: string;
};

export async function buscarProdutosCardapio(
  tenantSlug: string,
  filtros: BuscarProdutosFiltros,
): Promise<Category[]> {
  const response = await api.get<unknown>(`/r/${tenantSlug}/produtos`, {
    params: {
      search: filtros.search || undefined,
      categoriaId: filtros.categoriaId || undefined,
    },
  });
  return normalizeCategories(response.data);
}

export type HorarioDia = {
  dia: string;
  aberto: boolean;
  abre: string;
  fecha: string;
};

export type ConfiguracaoRestaurante = {
  nome: string;
  descricao: string | null;
  historia: string | null;
  horarios: HorarioDia[] | null;
  arteCardapioUrl: string | null;
  logoUrl: string | null;
  corBotaoPrimario: string;
  corBotaoSecundario: string;
  corTextoPrimario: string;
  corTextoSecundario: string;
  mostrarDescricao: boolean;
  mostrarFotos: boolean;
  mostrarIngredientes: boolean;
  mostrarPreco: boolean;
  enderecoCep: string | null;
  enderecoRua: string | null;
  enderecoNumero: string | null;
  enderecoBairro: string | null;
  enderecoCidade: string | null;
  permiteTakeaway: boolean;
  permiteDelivery: boolean;
};

export async function getConfiguracaoRestaurante(
  tenantSlug: string,
): Promise<ConfiguracaoRestaurante> {
  const response = await api.get<ConfiguracaoRestaurante>(
    `/r/${tenantSlug}/restaurante`,
  );
  return response.data;
}

export type AreaAtendimentoCidade = {
  id: string;
  cidade: string;
  uf: string;
  bairros: string[];
};

export async function getAreaAtendimento(
  tenantSlug: string,
): Promise<AreaAtendimentoCidade[]> {
  const response = await api.get<AreaAtendimentoCidade[]>(
    `/r/${tenantSlug}/area-atendimento`,
  );
  return response.data;
}

export function bairroAtendido(
  cidades: AreaAtendimentoCidade[],
  cidade: string,
  bairro: string,
): boolean {
  const cidadeNormalizada = cidade.trim().toLowerCase();
  const bairroNormalizado = bairro.trim().toLowerCase();
  return cidades.some(
    (c) =>
      c.cidade.trim().toLowerCase() === cidadeNormalizada &&
      c.bairros.some((b) => b.trim().toLowerCase() === bairroNormalizado),
  );
}

export type PedidoCriado = Pedido & { confirmacaoToken: string };

export async function createPedido(
  tenantSlug: string,
  payload: CreatePedidoPayload,
): Promise<PedidoCriado> {
  const response = await api.post<PedidoCriado>(
    `/r/${tenantSlug}/pedidos`,
    payload,
  );
  return response.data;
}

export async function validarCupom(
  tenantSlug: string,
  payload: { codigo: string; itens: CreatePedidoItemInput[] },
): Promise<CupomAplicado> {
  const response = await api.post<CupomAplicado>(`/r/${tenantSlug}/cupons/validar`, payload);
  return response.data;
}

export async function confirmarPagamento(
  tenantSlug: string,
  pedidoId: string,
  confirmacaoToken: string,
): Promise<{ pagamento: Pedido["pagamento"]; pedido: Pedido }> {
  const response = await api.patch<{
    pagamento: Pedido["pagamento"];
    pedido: Pedido;
  }>(`/r/${tenantSlug}/pedidos/${pedidoId}/confirmar-pagamento`, {
    confirmacaoToken,
  });
  return response.data;
}

export async function buscarStatusPagamento(
  tenantSlug: string,
  pedidoId: string,
): Promise<Pedido["pagamento"]> {
  const response = await api.get<Pedido["pagamento"]>(
    `/r/${tenantSlug}/pedidos/${pedidoId}/pagamento`,
  );
  return response.data;
}
