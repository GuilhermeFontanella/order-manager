import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { ProtectedRoute, useAuth } from '../context/AuthContext'
import Login from '../pages/login/Login'
import OrderMenu from '../pages/order/OrderMenu'
import MesaEntry from '../pages/order/MesaEntry'
import TenantEntry from '../pages/order/TenantEntry'
import ScanQR from '../pages/scan/ScanQR'
import Checkout from '../pages/checkout/Checkout'
import Kitchen from '../pages/kitchen/Kitchen'
import KitchenNavLink from '../components/kitchen/KitchenNavLink'
import Counter from '../pages/counter/Counter'
import CounterNavLink from '../components/counter/CounterNavLink'
import ReadyOrders from '../pages/ready-orders/ReadyOrders'
import MesasAdmin from '../pages/admin/MesasAdmin'
import ProdutosAdmin from '../pages/admin/ProdutosAdmin'
import AdminPanel from '../pages/admin/panel/AdminPanel'
import DashboardSection from '../pages/admin/panel/sections/DashboardSection'
import CardapioSection from '../pages/admin/panel/sections/CardapioSection'
import EstoqueSection from '../pages/admin/panel/sections/EstoqueSection'
import PedidosSection from '../pages/admin/panel/sections/PedidosSection'
import EquipeSection from '../pages/admin/panel/sections/EquipeSection'
import DadosRestauranteSection from '../pages/admin/panel/sections/configuracoes/DadosRestauranteSection'
import AparenciaSection from '../pages/admin/panel/sections/configuracoes/AparenciaSection'
import PagamentoSection from '../pages/admin/panel/sections/configuracoes/PagamentoSection'
import MesasConfigSection from '../pages/admin/panel/sections/configuracoes/MesasConfigSection'
import CuponsSection from '../pages/admin/panel/sections/configuracoes/CuponsSection'
import AreaAtendimentoSection from '../pages/admin/panel/sections/configuracoes/AreaAtendimentoSection'
import ContaSection from '../pages/admin/panel/sections/configuracoes/ContaSection'
import ManualSection from '../pages/admin/panel/sections/ManualSection'
import ManualTopicSection from '../pages/admin/panel/sections/ManualTopicSection'
import ChangePassword from '../pages/login/ChangePassword'
import ResetPassword from '../pages/login/ResetPassword'

export function resolveDefaultRoute(isAuthenticated: boolean, role: string | null) {
  if (!isAuthenticated) {
    return '/login'
  }

  if (role === 'MANAGER') {
    return '/admin'
  }

  if (role === 'HEAD_CHEF' || role === 'KITCHEN') {
    return '/kitchen'
  }

  if (role === 'COUNTER') {
    return '/counter'
  }

  return '/order'
}

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()
  const role = user?.papel ?? null
  const defaultRoute = resolveDefaultRoute(isAuthenticated, role)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={defaultRoute} replace />}
        />

        <Route path="/primeiro-acesso" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={defaultRoute} replace />
            ) : (
              <Login />
            )
          }
        />

        <Route path="/order" element={<OrderMenu />} />

        <Route path="/r/:tenantSlug/mesa/:qrCodeToken" element={<MesaEntry />} />
        <Route path="/r/:tenantSlug" element={<TenantEntry />} />

        <Route path="/scan" element={<ScanQR />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/ready-orders" element={<ReadyOrders />} />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredRoles={['HEAD_CHEF', 'KITCHEN', 'MANAGER']}>
              <Kitchen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counter"
          element={
            <ProtectedRoute requiredRoles={['COUNTER', 'HEAD_CHEF', 'MANAGER']}>
              <Counter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex flex-wrap gap-4 p-6">
                <KitchenNavLink />
                <CounterNavLink />
                {(user?.papel === 'MANAGER' || user?.papel === 'HEAD_CHEF') && (
                  <>
                    <Link
                      to="/admin/mesas"
                      className="inline-flex items-center gap-3 rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
                    >
                      Mesas
                    </Link>
                    <Link
                      to="/admin/produtos"
                      className="inline-flex items-center gap-3 rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
                    >
                      Cardápio
                    </Link>
                  </>
                )}
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['MANAGER']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardSection />} />
          <Route path="cardapio" element={<CardapioSection />} />
          <Route path="estoque" element={<EstoqueSection />} />
          <Route path="pedidos" element={<PedidosSection />} />
          <Route path="equipe" element={<EquipeSection />} />
          <Route path="manual" element={<ManualSection />} />
          <Route path="manual/:slug" element={<ManualTopicSection />} />
          <Route path="configuracoes">
            <Route index element={<Navigate to="dados-restaurante" replace />} />
            <Route path="dados-restaurante" element={<DadosRestauranteSection />} />
            <Route path="aparencia" element={<AparenciaSection />} />
            <Route path="pagamento" element={<PagamentoSection />} />
            <Route path="cupons" element={<CuponsSection />} />
            <Route path="area-atendimento" element={<AreaAtendimentoSection />} />
            <Route path="mesas" element={<MesasConfigSection />} />
            <Route path="conta" element={<ContaSection />} />
          </Route>
        </Route>

        <Route
          path="/admin/mesas"
          element={
            <ProtectedRoute requiredRoles={['MANAGER', 'HEAD_CHEF']}>
              <MesasAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute requiredRoles={['MANAGER', 'HEAD_CHEF']}>
              <ProdutosAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={<div>Acesso negado. Você não tem permissão para acessar esta página.</div>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}