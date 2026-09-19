import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react'
import { ThemeProvider } from '@mui/material/styles'
import { useAuth } from '../../../context/AuthContext'
import { EmberThemeProvider, useEmberTheme } from '../../../context/EmberThemeContext'
import ThemeToggle from '../../../components/ember/ThemeToggle'
import Sidebar from './components/Sidebar'
import { createAdminMuiTheme } from './muiTheme'
import './admin-panel.css'

const MOBILE_BREAKPOINT = 860

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  cardapio: 'Cardápio',
  estoque: 'Estoque',
  pedidos: 'Pedidos',
  equipe: 'Equipe',
  manual: 'Manual',
  configuracoes: 'Configurações',
  'dados-restaurante': 'Dados do restaurante',
  aparencia: 'Aparência',
  pagamento: 'Pagamento',
  cupons: 'Cupons',
  'area-atendimento': 'Área de atendimento',
  mesas: 'Mesas',
  conta: 'Conta',
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

export default function AdminPanel() {
  return (
    <EmberThemeProvider>
      <AdminPanelShell />
    </EmberThemeProvider>
  )
}

function AdminPanelShell() {
  const { theme } = useEmberTheme()
  const muiTheme = useMemo(() => createAdminMuiTheme(theme), [theme])
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // O próprio clique num item do menu já fecha o drawer via Sidebar's onNavigate — não
  // precisamos de um efeito escutando location.pathname pra isso.
  const currentSlug = location.pathname.split('/').filter(Boolean).pop() ?? ''
  const sectionTitle = location.pathname.startsWith('/admin/manual')
    ? 'Manual'
    : SECTION_TITLES[currentSlug] ?? 'Painel'
  const brandName = user?.tenant?.nome ?? 'Painel'
  const firstName = user?.nome?.split(' ')[0] ?? ''

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="admin-panel-page ember-theme" data-theme={theme}>
        {isMobile && mobileOpen && (
          <div className="ap-overlay" onClick={() => setMobileOpen(false)} />
        )}

        <Sidebar
          brandName={brandName}
          isMobile={isMobile}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
        

        <div className="ap-main">
          <header className="ap-header">
            <div className="ap-header-left">
              {isMobile && (
                <button
                  type="button"
                  className="ap-menu-btn"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu size={17} />
                </button>
              )}
              {!isMobile && (
        <button type="button" className="ap-sidebar-collapse" onClick={() => setCollapsed(prev => !prev)}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      )}
              <h1 className="ap-header-title">{sectionTitle}</h1>
            </div>

            <div className="ap-header-right">
              <span className="ap-user-badge">Gerente · {firstName}</span>
              <ThemeToggle />
              <button
                type="button"
                className="ap-logout-btn"
                onClick={handleLogout}
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="ap-content">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
