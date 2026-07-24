type Tab = 'retirada' | 'todos'

type Props = {
  tab: Tab
  onChange: (tab: Tab) => void
  countRetirada: number
}

export default function TabsNav({ tab, onChange, countRetirada }: Props) {
  return (
    <div className="counter-tabs-wrap">
      <div className="counter-tabs">
        <button
          type="button"
          className={`counter-tab${tab === 'retirada' ? ' active' : ''}`}
          onClick={() => onChange('retirada')}
        >
          Para retirada <span className="counter-count-pill">{countRetirada}</span>
        </button>
        <button
          type="button"
          className={`counter-tab${tab === 'todos' ? ' active' : ''}`}
          onClick={() => onChange('todos')}
        >
          Todos os pedidos
        </button>
      </div>
    </div>
  )
}
