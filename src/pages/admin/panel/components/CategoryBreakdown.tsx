export type CategoryShare = {
  nome: string
  pct: number
}

export default function CategoryBreakdown({ rows }: { rows: CategoryShare[] }) {
  return (
    <div>
      {rows.map(row => (
        <div className="ap-progress-row" key={row.nome}>
          <div className="ap-progress-head">
            <span className="ap-progress-head-label">{row.nome}</span>
            <span className="ap-progress-head-value">{row.pct}%</span>
          </div>
          <div className="ap-progress-track">
            <div className="ap-progress-fill" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
