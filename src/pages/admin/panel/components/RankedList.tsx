export type RankedRow = {
  id: string
  label: string
  sublabel?: string
  value: string
  emphasize?: boolean
}

export default function RankedList({ rows }: { rows: RankedRow[] }) {
  return (
    <div>
      {rows.map(row => (
        <div className="ap-ranked-row" key={row.id}>
          <div>
            <div className="ap-ranked-label">{row.label}</div>
            {row.sublabel && <div className="ap-ranked-sublabel">{row.sublabel}</div>}
          </div>
          <div className={`ap-ranked-value${row.emphasize ? '' : ' is-plain'}`}>{row.value}</div>
        </div>
      ))}
    </div>
  )
}
