import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, useAuth } from '../context/AuthContext'
import Login from '../pages/login/Login'
import OrderMenu from '../pages/order/OrderMenu'
import ScanQR from '../pages/scan/ScanQR'
import Checkout from '../pages/checkout/Checkout'
import Kitchen from '../pages/kitchen/Kitchen'
import KitchenNavLink from '../components/kitchen/KitchenNavLink'
import Counter from '../pages/counter/Counter'
import CounterNavLink from '../components/counter/CounterNavLink'

function resolveDefaultRoute(isAuthenticated: boolean, role: string | null) {
  if (!isAuthenticated) {
    return '/login'
  }

  if (role === 'admin') {
    return '/dashboard'
  }

  if (role === 'cozinha') {
    return '/kitchen'
  }

  if (role === 'balcao') {
    return '/counter'
  }

  return '/order/table-1'
}

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role ?? localStorage.getItem('userRole')
  const defaultRoute = resolveDefaultRoute(isAuthenticated, role)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={defaultRoute} replace />}
        />

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

        <Route path="/order/:tableId" element={<OrderMenu />} />

        <Route path="/scan" element={<ScanQR />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredRoles={['cozinha', 'admin']}>
              <Kitchen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counter"
          element={
            <ProtectedRoute requiredRoles={['balcao', 'admin']}>
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
              </div>
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