import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { groupByCategory, manualTopics, normalizeText } from '../manual/manualContent'

export default function ManualSection() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const term = normalizeText(query.trim())
    const filtered = term ? manualTopics.filter(topic => topic.searchText.includes(term)) : manualTopics
    return groupByCategory(filtered)
  }, [query])

  return (
    <div className="ap-manual">
      <p className="ap-card-sub">Guias passo a passo para usar o painel. Escolha um assunto abaixo.</p>

      <div className="ap-manual-search">
        <Search size={16} />
        <input
          className="ap-input"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Buscar no manual (ex: cardápio, preço, foto)"
          aria-label="Buscar no manual"
        />
      </div>

      {groups.length === 0 ? (
        <p className="ap-card-sub">Nenhum tópico encontrado para "{query}".</p>
      ) : (
        groups.map(([category, topics]) => (
          <section key={category} className="ap-manual-group">
            <h2 className="ap-manual-group-title">{category}</h2>
            <div className="ap-manual-list">
              {topics.map(topic => (
                <Link key={topic.slug} to={`/admin/manual/${topic.slug}`} className="ap-card ap-manual-item">
                  <BookOpen size={18} />
                  <span>
                    <span className="ap-manual-item-title">{topic.title}</span>
                    {topic.summary && <span className="ap-manual-item-sub">{topic.summary}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
