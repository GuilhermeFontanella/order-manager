export type StatItem = {
  icon: string
  label: string
  value: string
  variant?: 'green' | 'gold' | 'blue'
}

export default function StatsRow({ items, gridClassName = 'counter-stats-row' }: { items: StatItem[]; gridClassName?: string }) {
  return (
    <div className={gridClassName}>
      {items.map((item, idx) => (
        <div className="counter-stat-card" key={idx}>
          <div className={`counter-stat-icon${item.variant && item.variant !== 'green' ? ` ${item.variant}` : ''}`}>
            {item.icon}
          </div>
          <div>
            <div className="counter-stat-label">{item.label}</div>
            <div className="counter-stat-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
