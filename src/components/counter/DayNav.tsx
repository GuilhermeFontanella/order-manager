type Props = {
  label: string
  sub?: string
  onPrev: () => void
  onNext: () => void
  prevDisabled: boolean
  nextDisabled: boolean
}

export default function DayNav({ label, sub, onPrev, onNext, prevDisabled, nextDisabled }: Props) {
  return (
    <div className="counter-day-nav">
      <button type="button" className="counter-day-nav-btn" onClick={onPrev} disabled={prevDisabled}>
        ‹
      </button>
      <div>
        <div className="counter-day-nav-label">{label}</div>
        {sub && <span className="counter-day-nav-sub">{sub}</span>}
      </div>
      <button type="button" className="counter-day-nav-btn" onClick={onNext} disabled={nextDisabled}>
        ›
      </button>
    </div>
  )
}
