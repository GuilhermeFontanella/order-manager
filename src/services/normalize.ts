import type { Category, Item } from '../data/menu'
import { resolveMediaUrl } from './apiClient'

export function asText(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return undefined
}

export function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '').replace(',', '.')
    const parsed = Number(normalized)
    if (Number.isFinite(parsed)) return Math.round(parsed * 100)
  }
  return 0
}

export function normalizeItem(raw: Record<string, unknown>): Item {
  const name = asText(raw.nome) ?? asText(raw.name) ?? asText(raw.titulo) ?? 'Item sem nome'
  const description = asText(raw.desc) ?? asText(raw.descricao) ?? asText(raw.description)
  const price = asNumber(raw.preco ?? raw.price ?? raw.valor ?? raw.valorUnitario)
  const id = asText(raw.id) ?? asText(raw._id) ?? asText(raw.codigo) ?? `${name}-${Math.random().toString(36).slice(2, 8)}`

  return {
    id,
    nome: name,
    desc: description,
    preco: price,
    emoji: asText(raw.emoji) ?? asText(raw.icon) ?? '🍽️',
    disponivel: raw.disponivel === false || raw.available === false ? false : true,
    grupos: Array.isArray(raw.grupos) ? (raw.grupos as unknown[]).filter(Boolean) : [],
    fotos: Array.isArray(raw.fotos)
      ? (raw.fotos as string[]).map(resolveMediaUrl)
      : Array.isArray(raw.imagens)
        ? (raw.imagens as string[]).map(resolveMediaUrl)
        : [],
  }
}

export function normalizeCategories(payload: unknown): Category[] {
  if (Array.isArray(payload)) {
    const first = payload[0]
    if (first && typeof first === 'object' && 'itens' in (first as Record<string, unknown>) || 'items' in (first as Record<string, unknown>)) {
      return (payload as Array<Record<string, unknown>>).map((category, index) => ({
        id: asText(category.id) ?? asText(category.slug) ?? `categoria-${index + 1}`,
        nome: asText(category.nome) ?? asText(category.name) ?? `Categoria ${index + 1}`,
        itens: Array.isArray(category.itens) ? (category.itens as Array<Record<string, unknown>>).map(normalizeItem) : [],
      }))
    }

    const grouped = new Map<string, { nome: string; itens: Item[] }>()

    for (const entry of payload as Array<Record<string, unknown>>) {
      const categoriaRaw = entry.categoria
      const categoriaObj = categoriaRaw && typeof categoriaRaw === 'object' ? (categoriaRaw as Record<string, unknown>) : undefined

      const categoryName =
        (categoriaObj ? asText(categoriaObj.nome) : asText(categoriaRaw)) ??
        asText(entry.category) ?? asText(entry.categoriaNome) ?? asText(entry.categoryName) ?? 'Geral'
      const categoryId =
        (categoriaObj ? asText(categoriaObj.id) : undefined) ??
        asText(entry.categoriaId) ?? asText(entry.categoryId) ??
        categoryName.toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '').replace(/\s+/g, '-')
      const item = normalizeItem(entry)

      const existing = grouped.get(categoryId)
      if (existing) {
        existing.itens.push(item)
      } else {
        grouped.set(categoryId, { nome: categoryName, itens: [item] })
      }
    }

    return Array.from(grouped.entries()).map(([id, { nome, itens }]) => ({
      id,
      nome,
      itens,
    }))
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) {
      return normalizeCategories(data)
    }

    const produtos = (payload as Record<string, unknown>).produtos
    if (Array.isArray(produtos)) {
      return normalizeCategories(produtos)
    }

    const items = (payload as Record<string, unknown>).items
    if (Array.isArray(items)) {
      return normalizeCategories(items)
    }
  }

  return []
}
