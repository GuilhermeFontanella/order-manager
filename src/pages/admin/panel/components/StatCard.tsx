import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export type StatCardVariant = 'green' | 'gold' | 'blue'

export default function StatCard({
  icon: Icon,
  label,
  value,
  deltaPct,
  deltaCaption = 'vs. período anterior',
  variant = 'green',
}: {
  icon: LucideIcon
  label: string
  value: string
  deltaPct?: number
  deltaCaption?: string
  variant?: StatCardVariant
}) {
  return (
    <div className="ap-stat-card">
      <div className="ap-stat-head">
        <div className={`ap-stat-icon${variant !== 'green' ? ` variant-${variant}` : ''}`}>
          <Icon size={16} />
        </div>
        <div className="ap-stat-label">{label}</div>
      </div>
      <div className="ap-stat-value">{value}</div>
      {deltaPct !== undefined && (
        <div className={`ap-stat-delta${deltaPct < 0 ? ' is-down' : ''}`}>
          {deltaPct < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
          {(deltaPct >= 0 ? '+' : '') + deltaPct}% {deltaCaption}
        </div>
      )}
    </div>
  )
}
