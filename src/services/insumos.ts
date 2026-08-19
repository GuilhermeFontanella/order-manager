import { api } from './apiClient'

export type UnidadeMedida = 'UN' | 'KG' | 'G' | 'L' | 'ML'

export const UNIDADE_LABEL: Record<UnidadeMedida, string> = {
  UN: 'un',
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'ml',
}

export type CategoriaInsumo = {
  id: string
  nome: string
}

export type Insumo = {
  id: string
  nome: string
  categoriaId: string
  categoria: CategoriaInsumo
  unidadeMedida: UnidadeMedida
  quantidadeEstoque: string
  estoqueMinimo: string | null
  custoUnitario: string | null
  _count: { produtos: number }
}

export type InsumoInput = {
  nome: string
  categoriaId: string
  unidadeMedida?: UnidadeMedida
  quantidadeEstoque?: number
  estoqueMinimo?: number
  custoUnitario?: number
}

export async function listCategoriasInsumo(): Promise<CategoriaInsumo[]> {
  const response = await api.get<CategoriaInsumo[]>('/categorias-insumo')
  return response.data
}

export async function createCategoriaInsumo(nome: string): Promise<CategoriaInsumo> {
  const response = await api.post<CategoriaInsumo>('/categorias-insumo', { nome })
  return response.data
}

export async function deleteCategoriaInsumo(id: string): Promise<void> {
  await api.delete(`/categorias-insumo/${id}`)
}

export async function listInsumos(): Promise<Insumo[]> {
  const response = await api.get<Insumo[]>('/insumos')
  return response.data
}

export async function createInsumo(payload: InsumoInput): Promise<Insumo> {
  const response = await api.post<Insumo>('/insumos', payload)
  return response.data
}

export async function updateInsumo(id: string, payload: Partial<InsumoInput>): Promise<Insumo> {
  const response = await api.patch<Insumo>(`/insumos/${id}`, payload)
  return response.data
}

export async function deleteInsumo(id: string): Promise<void> {
  await api.delete(`/insumos/${id}`)
}
