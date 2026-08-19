import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Receipt,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { to: '/admin/estoque', label: 'Estoque', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: Receipt },
  { to: '/admin/equipe', label: 'Equipe', icon: Users },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({
  brandName,
  isMobile,
  collapsed,
  mobileOpen,
  onNavigate,
  onToggleCollapse,
}: {
  brandName: string
  isMobile: boolean
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: () => void
  onToggleCollapse: () => void
}) {
  const showLabels = isMobile || !collapsed
  const className = [
    'ap-sidebar',
    !isMobile && collapsed ? 'is-collapsed' : '',
    isMobile && mobileOpen ? 'is-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={className}>
      <div className="ap-sidebar-header">
        <div className="ap-sidebar-logo">{brandName.charAt(0).toUpperCase()}</div>
        {showLabels && (
          <div className="ap-sidebar-brand">
            <div className="ap-sidebar-brand-name">{brandName}</div>
            <div className="ap-sidebar-brand-tag">Gestão interna</div>
          </div>
        )}
      </div>

      <nav className="ap-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={item.label}
              className={({ isActive }) => `ap-nav-item${isActive ? ' is-active' : ''}`}
            >
              <span className="ap-nav-item-icon">
                <Icon size={17} />
              </span>
              {showLabels && <span className="ap-nav-item-label">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {!isMobile && (
        <button type="button" className="ap-sidebar-collapse" onClick={onToggleCollapse}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {showLabels && <span>Recolher</span>}
        </button>
      )}
    </aside>
  )
}
