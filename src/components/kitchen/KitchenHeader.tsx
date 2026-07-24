import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'

type Props = {
  clock: string
  adminMode: boolean
  onToggleAdmin: () => void
  restaurantOpen: boolean
  onToggleRestaurantOpen: () => void
  onSimularNovoPedido: () => void
  onLogout: () => void
}

export default function KitchenHeader({
  clock,
  adminMode,
  onToggleAdmin,
  restaurantOpen,
  onToggleRestaurantOpen,
  onSimularNovoPedido,
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

          {restaurantOpen && (
            <button type="button" className="kitchen-btn-sim" onClick={onSimularNovoPedido}>
              + Simular novo pedido
            </button>
          )}

          <div
            className={`kitchen-admin-toggle${adminMode ? ' on' : ''}`}
            onClick={onToggleAdmin}
          >
            <span>Modo admin</span>
            <div className="kitchen-switch" />
          </div>

          <span className={`kitchen-role-badge${adminMode ? ' admin' : ''}`}>
            {adminMode ? 'Cozinha admin' : 'Cozinha'}
          </span>

          <span className="kitchen-clock">{clock}</span>

          <button type="button" className="kitchen-btn-logout" onClick={onLogout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
