import { PERIOD_OPTIONS, type PeriodId } from '../mock/dashboardMock'

export default function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodId
  onChange: (period: PeriodId) => void
}) {
  return (
    <div className="ap-period-filter">
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.id}
          type="button"
          className={`ap-period-chip${value === opt.id ? ' is-active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
