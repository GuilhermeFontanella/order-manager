import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (total === 0) return null

  const inicio = (page - 1) * pageSize + 1
  const fim = Math.min(page * pageSize, total)

  return (
    <div className="ap-pagination">
      <span className="ap-pagination-info">
        {inicio}–{fim} de {total}
      </span>
      <div className="ap-pagination-controls">
        <button
          type="button"
          className="ap-btn ap-btn-ghost ap-btn-icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="ap-pagination-page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="ap-btn ap-btn-ghost ap-btn-icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
