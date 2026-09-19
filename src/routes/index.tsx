import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ProtectedRoute, useAuth } from '../context/AuthContext'
import KitchenNavLink from '../components/kitchen/KitchenNavLink'
import CounterNavLink from '../components/counter/CounterNavLink'

const Login = lazy(() => import('../pages/login/Login'))
const OrderMenu = lazy(() => import('../pages/order/OrderMenu'))
const MesaEntry = lazy(() => import('../pages/order/MesaEntry'))
const TenantEntry = lazy(() => import('../pages/order/TenantEntry'))
const ScanQR = lazy(() => import('../pages/scan/ScanQR'))
const Checkout = lazy(() => import('../pages/checkout/Checkout'))
const Kitchen = lazy(() => import('../pages/kitchen/Kitchen'))
const Counter = lazy(() => import('../pages/counter/Counter'))
const ReadyOrders = lazy(() => import('../pages/ready-orders/ReadyOrders'))
const MesasAdmin = lazy(() => import('../pages/admin/MesasAdmin'))
const ProdutosAdmin = lazy(() => import('../pages/admin/ProdutosAdmin'))
const AdminPanel = lazy(() => import('../pages/admin/panel/AdminPanel'))
const DashboardSection = lazy(() => import('../pages/admin/panel/sections/DashboardSection'))
const CardapioSection = lazy(() => import('../pages/admin/panel/sections/CardapioSection'))
const EstoqueSection = lazy(() => import('../pages/admin/panel/sections/EstoqueSection'))
const PedidosSection = lazy(() => import('../pages/admin/panel/sections/PedidosSection'))
const EquipeSection = lazy(() => import('../pages/admin/panel/sections/EquipeSection'))
const DadosRestauranteSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/DadosRestauranteSection'))
const AparenciaSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/AparenciaSection'))
const PagamentoSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/PagamentoSection'))
const MesasConfigSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/MesasConfigSection'))
const CuponsSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/CuponsSection'))
const AreaAtendimentoSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/AreaAtendimentoSection'))
const ContaSection = lazy(() => import('../pages/admin/panel/sections/configuracoes/ContaSection'))
const ManualSection = lazy(() => import('../pages/admin/panel/sections/ManualSection'))
const ManualTopicSection = lazy(() => import('../pages/admin/panel/sections/ManualTopicSection'))
const ChangePassword = lazy(() => import('../pages/login/ChangePassword'))
const ResetPassword = lazy(() => import('../pages/login/ResetPassword'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
    </div>
  )
}

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
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </BrowserRouter>
  )
}
