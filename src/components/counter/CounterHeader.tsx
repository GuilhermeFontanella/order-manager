import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '../ember/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

type Props = {
  clock: string
  adminMode: boolean
  onToggleAdmin: () => void
  restaurantOpen: boolean
  onAbrirRestaurante: () => void
  onEncerrarAtividades: () => void
  onLogout: () => void
}

export default function CounterHeader({
  clock,
  adminMode,
  onToggleAdmin,
  restaurantOpen,
  onAbrirRestaurante,
  onEncerrarAtividades,
  onLogout,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="counter-header">
      <div className="counter-header-left">
        <div className="counter-brand-mark">🖥️</div>
        <div className="counter-brand-text">
          <div className="counter-name">{user?.tenant?.nome ?? 'Restaurante'}</div>
          <div className="counter-sub">Painel do Balcão</div>
        </div>
      </div>

      <button
        type="button"
        className="counter-menu-btn"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {menuOpen && <div className="counter-drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      <div className={`counter-header-right${menuOpen ? ' open' : ''}`}>
        <button
          type="button"
          className="counter-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>

        <span className={`counter-status-pill${restaurantOpen ? ' open' : ' closed'}`}>
          <span className="counter-dot" />
          <span>{restaurantOpen ? 'Aberto' : 'Fechado'}</span>
        </span>

        {adminMode && !restaurantOpen && (
          <button type="button" className="counter-btn-open" onClick={onAbrirRestaurante}>
            ▶ Abrir restaurante
          </button>
        )}

        {adminMode && restaurantOpen && (
          <button type="button" className="counter-btn-close" onClick={onEncerrarAtividades}>
            ■ Encerrar atividades
          </button>
        )}

        <div className={`counter-admin-toggle${adminMode ? ' on' : ''}`} onClick={onToggleAdmin}>
          <span>Modo admin</span>
          <div className="counter-switch" />
        </div>

        <span className={`counter-role-badge${adminMode ? ' admin' : ''}`}>
          {adminMode ? 'Balcão admin' : 'Balcão'}
        </span>

        <span className="counter-clock">{clock}</span>

        <ThemeToggle />

        <button type="button" className="counter-btn-logout" onClick={onLogout} aria-label="Sair">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
