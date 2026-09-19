import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Receipt,
  Users,
  Settings,
  BookOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { to: '/admin/estoque', label: 'Estoque', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: Receipt },
  { to: '/admin/equipe', label: 'Equipe', icon: Users },
  { to: '/admin/manual', label: 'Manual', icon: BookOpen },
  {
    to: '/admin/configuracoes',
    label: 'Configurações',
    icon: Settings,
    children: [
      { to: '/admin/configuracoes/dados-restaurante', label: 'Dados do restaurante' },
      { to: '/admin/configuracoes/aparencia', label: 'Aparência' },
      { to: '/admin/configuracoes/pagamento', label: 'Pagamento' },
      { to: '/admin/configuracoes/cupons', label: 'Cupons' },
      { to: '/admin/configuracoes/area-atendimento', label: 'Área de atendimento' },
      { to: '/admin/configuracoes/mesas', label: 'Mesas' },
      { to: '/admin/configuracoes/conta', label: 'Conta' },
    ],
  },
]

export default function Sidebar({
  brandName,
  isMobile,
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  brandName: string
  isMobile: boolean
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: () => void
}) {
  const location = useLocation()
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
          <div className="ap-sidebar-brand text-left">
            <div className="ap-sidebar-brand-name">{brandName}</div>
            <div className="ap-sidebar-brand-tag mt-2">Gestão interna</div>
          </div>
        )}
      </div>

      <nav className="ap-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isParentActive = location.pathname.startsWith(item.to)
          return (
            <div key={item.to} className="ap-nav-group">
              <NavLink
                to={item.to}
                onClick={item.children ? undefined : onNavigate}
                title={item.label}
                className={({ isActive }) => `ap-nav-item${isActive ? ' is-active' : ''}`}
              >
                <span className="ap-nav-item-icon">
                  <Icon size={17} />
                </span>
                {showLabels && <span className="ap-nav-item-label">{item.label}</span>}
              </NavLink>

              {item.children && showLabels && isParentActive && (
                <div className="ap-nav-submenu text-left">
                  {item.children.map(child => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={onNavigate}
                      className={({ isActive }) => `ap-nav-subitem${isActive ? ' is-active' : ''}`}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
