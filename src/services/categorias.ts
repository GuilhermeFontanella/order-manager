import { api } from './apiClient'

export type TipoCategoria = 'COMIDA' | 'BEBIDA' | 'BEBIDA_ALCOOLICA'

export type Categoria = {
  id: string
  nome: string
  descricao: string | null
  tipo: TipoCategoria
  ativa: boolean
}

export type CategoriaInput = {
  nome: string
  descricao?: string
}

export async function listCategorias(): Promise<Categoria[]> {
  const response = await api.get<Categoria[]>('/categorias')
  return response.data
}

export async function createCategoria(payload: CategoriaInput): Promise<Categoria> {
  const response = await api.post<Categoria>('/categorias', payload)
  return response.data
}

export async function updateCategoria(id: string, payload: Partial<Pick<Categoria, 'nome' | 'descricao' | 'ativa'>>): Promise<Categoria> {
  const response = await api.patch<Categoria>(`/categorias/${id}`, payload)
  return response.data
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
