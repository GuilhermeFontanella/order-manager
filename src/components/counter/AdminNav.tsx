type Page = 'balcao' | 'dashboard'

type Props = {
  page: Page
  onChange: (page: Page) => void
}

export default function AdminNav({ page, onChange }: Props) {
  return (
    <div className="counter-admin-nav-wrap">
      <div className="counter-admin-nav">
        <button
          type="button"
          className={`counter-admin-nav-item${page === 'balcao' ? ' active' : ''}`}
          onClick={() => onChange('balcao')}
        >
          🖥️ Painel do balcão
        </button>
        <button
          type="button"
          className={`counter-admin-nav-item${page === 'dashboard' ? ' active' : ''}`}
          onClick={() => onChange('dashboard')}
        >
          📊 Dashboard do dia
        </button>
      </div>
    </div>
  )
}
