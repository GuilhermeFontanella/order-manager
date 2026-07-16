import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, useAuth } from '../context/AuthContext'
import Login from '../pages/login/Login'
import OrderMenu from '../pages/order/OrderMenu'
import ScanQR from '../pages/scan/ScanQR'
import Checkout from '../pages/checkout/Checkout'

function resolveDefaultRoute(isAuthenticated: boolean, role: string | null) {
  if (!isAuthenticated) {
    return '/login'
  }

  if (role === 'admin') {
    return '/dashboard'
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>Dashboard</>
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