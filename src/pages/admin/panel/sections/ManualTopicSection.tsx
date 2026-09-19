import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { findTopic, resolveManualImage } from '../manual/manualContent'

export default function ManualTopicSection() {
  const { slug } = useParams()
  const topic = findTopic(slug)

  const components = useMemo<Components>(
    () => ({
      a: ({ href = '', children }) =>
        href.startsWith('/') ? (
          <Link to={href}>{children}</Link>
        ) : (
          <a href={href} target="_blank" rel="noreferrer noopener">
            {children}
          </a>
        ),
      img: ({ src = '', alt }) => <img src={topic ? resolveManualImage(topic, src) : src} alt={alt ?? ''} loading="lazy" />,
    }),
    [topic],
  )

  if (!topic) return <Navigate to="/admin/manual" replace />

  return (
    <div className="ap-manual">
      <Link to="/admin/manual" className="ap-manual-back">
        <ChevronLeft size={15} />
        Voltar ao manual
      </Link>

      <article className="ap-card ap-manual-article">
        <h1 className="ap-manual-article-title">{topic.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {topic.body}
        </ReactMarkdown>
      </article>
    </div>
  )
}
