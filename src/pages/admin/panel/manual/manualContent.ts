// Os manuais vivem em src/manual/**/*.md e são embutidos no bundle no build,
// então o usuário só consegue lê-los — não existe caminho de edição em runtime.
const rawFiles = import.meta.glob('/src/manual/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const imageUrls = import.meta.glob('/src/manual/**/*.{png,jpg,jpeg,webp,gif,svg}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type ManualTopic = {
  slug: string
  title: string
  category: string
  order: number
  summary: string
  body: string
  dir: string
  searchText: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function parseTopic(path: string, raw: string): ManualTopic {
  const match = raw.match(FRONTMATTER)
  const meta: Record<string, string> = {}
  const body = match ? match[2] : raw

  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const separator = line.indexOf(':')
      if (separator > 0) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
    }
  }

  const fileName = path.split('/').pop()!.replace(/\.md$/, '')
  const title = meta.title || fileName
  const summary = meta.summary ?? ''

  return {
    slug: fileName,
    title,
    category: meta.category || 'Geral',
    order: Number(meta.order) || 999,
    summary,
    body,
    dir: path.slice(0, path.lastIndexOf('/')),
    searchText: normalizeText(`${title} ${summary} ${body}`),
  }
}

export const manualTopics: ManualTopic[] = Object.entries(rawFiles)
  .map(([path, raw]) => parseTopic(path, raw))
  .sort((a, b) => a.category.localeCompare(b.category, 'pt-BR') || a.order - b.order)

export function findTopic(slug: string | undefined) {
  return manualTopics.find(topic => topic.slug === slug)
}

export function groupByCategory(topics: ManualTopic[]) {
  const groups = new Map<string, ManualTopic[]>()
  for (const topic of topics) {
    groups.set(topic.category, [...(groups.get(topic.category) ?? []), topic])
  }
  return [...groups.entries()]
}

// Resolve imagens referenciadas no markdown (ex: ![](./img/tela.png)) relativas à pasta do tópico.
export function resolveManualImage(topic: ManualTopic, src: string) {
  if (/^(https?:|data:)/.test(src)) return src
  const segments = `${topic.dir}/${src}`.split('/')
  const resolved: string[] = []
  for (const segment of segments) {
    if (segment === '..') resolved.pop()
    else if (segment !== '.' && segment !== '') resolved.push(segment)
  }
  return imageUrls[`/${resolved.join('/')}`] ?? src
}
