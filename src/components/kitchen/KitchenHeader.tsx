import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '../ember/ThemeToggle'

const PAPEL_LABEL: Record<string, string> = {
  MANAGER: 'Manager',
  HEAD_CHEF: 'Head chef',
  KITCHEN: 'Cozinha',
}

type Props = {
  clock: string
  papel: string | undefined
  restaurantOpen: boolean
  onToggleRestaurantOpen: () => void
  onLogout: () => void
}

export default function KitchenHeader({
  clock,
  papel,
  restaurantOpen,
  onToggleRestaurantOpen,
  onLogout,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="kitchen-header">
      <div className="kitchen-header-left max-w-[1400px] w-full m-auto flex items-center justify-between">
        <div className="kitchen-header-left">
          <div className="kitchen-brand-mark">🍔</div>
          <div className="kitchen-brand-text">
            <div className="kitchen-name">Botequim do Zé</div>
            <div className="kitchen-sub">Painel da Cozinha</div>
          </div>
        </div>

        <button
          type="button"
          className="kitchen-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {menuOpen && <div className="kitchen-drawer-backdrop" onClick={() => setMenuOpen(false)} />}

        <div className={`kitchen-header-right${menuOpen ? ' open' : ''}`}>
          <button
            type="button"
            className="kitchen-drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={`kitchen-status-pill${restaurantOpen ? '' : ' closed'}`}
            onClick={onToggleRestaurantOpen}
            title="Controle só para validação do protótipo — no app real, esse status vem do balcão"
          >
            <span className="kitchen-dot" />
            <span>{restaurantOpen ? 'Restaurante aberto' : 'Restaurante fechado'}</span>
          </button>

          <span className={`kitchen-role-badge${papel === 'MANAGER' || papel === 'HEAD_CHEF' ? ' admin' : ''}`}>
            {(papel && PAPEL_LABEL[papel]) ?? 'Cozinha'}
          </span>

          <span className="kitchen-clock">{clock}</span>

          <span className="kitchen-theme-toggle-wrap">
            <ThemeToggle />
          </span>

          <button type="button" className="kitchen-btn-logout" onClick={onLogout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
