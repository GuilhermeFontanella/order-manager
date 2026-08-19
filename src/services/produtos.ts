import { api } from './apiClient'
import type { Category } from '../data/menu'
import { normalizeCategories } from './normalize'
import type { Categoria } from './categorias'

export type Produto = {
  id: string
  nome: string
  descricao: string | null
  preco: string
  categoria: string | null
  disponivel: boolean
}

export type ProdutoInput = {
  nome: string
  descricao?: string
  preco: number
  categoria?: string
  disponivel?: boolean
}

export async function getProdutos(): Promise<Category[]> {
  const response = await api.get<unknown>('/produtos')
  return normalizeCategories(response.data)
}

export async function listProdutos(): Promise<Produto[]> {
  const response = await api.get<Produto[]>('/produtos')
  return response.data
}

export async function createProduto(payload: ProdutoInput): Promise<Produto> {
  const response = await api.post<Produto>('/produtos', payload)
  return response.data
}

export async function updateProduto(id: string, payload: Partial<ProdutoInput>): Promise<Produto> {
  const response = await api.patch<Produto>(`/produtos/${id}`, payload)
  return response.data
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`)
}

// --- Cadastro completo do Cardápio (categoria/item real, distinto do fluxo acima) ---

export type OpcaoValor = {
  id: string
  nome: string
  precoAdicional: string
}

export type OpcaoGrupo = {
  id: string
  nome: string
  multiplaEscolha: boolean
  obrigatorio: boolean
  opcoes: OpcaoValor[]
}

export type ProdutoInsumoLink = {
  id: string
  insumoId: string
  insumo: { id: string; nome: string; unidadeMedida: string }
  quantidade: string
}

export type ProdutoDetalhado = {
  id: string
  nome: string
  descricao: string | null
  preco: string
  categoriaId: string | null
  categoria: Categoria | null
  disponivel: boolean
  imagens: string[]
  gruposOpcao: OpcaoGrupo[]
  insumos: ProdutoInsumoLink[]
}

export type OpcaoValorInput = {
  nome: string
  precoAdicional?: number
}

export type OpcaoGrupoInput = {
  nome: string
  multiplaEscolha?: boolean
  obrigatorio?: boolean
  opcoes: OpcaoValorInput[]
}

export type ProdutoInsumoInput = {
  insumoId: string
  quantidade: number
}

export type ProdutoDetalhadoInput = {
  nome: string
  descricao?: string
  preco: number
  categoriaId?: string
  disponivel?: boolean
  imagens?: string[]
  gruposOpcao?: OpcaoGrupoInput[]
  insumos?: ProdutoInsumoInput[]
}

export async function uploadProdutoImagem(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('arquivo', file)
  const response = await api.post<{ url: string }>('/produtos/imagens', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.url
}

export async function listProdutosDetalhado(): Promise<ProdutoDetalhado[]> {
  const response = await api.get<ProdutoDetalhado[]>('/produtos')
  return response.data
}

export async function createProdutoDetalhado(payload: ProdutoDetalhadoInput): Promise<ProdutoDetalhado> {
  const response = await api.post<ProdutoDetalhado>('/produtos', payload)
  return response.data
}

export async function updateProdutoDetalhado(id: string, payload: Partial<ProdutoDetalhadoInput>): Promise<ProdutoDetalhado> {
  const response = await api.patch<ProdutoDetalhado>(`/produtos/${id}`, payload)
  return response.data
}
