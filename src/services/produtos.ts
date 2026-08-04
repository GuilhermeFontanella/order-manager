import { api } from './apiClient'
import type { Category } from '../data/menu'
import { normalizeCategories } from './normalize'

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
