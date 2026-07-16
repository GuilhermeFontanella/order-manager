import './App.css'
import { AuthProvider } from '../context/AuthContext'
import { AppRoutes } from '../routes'
import { CartProvider } from '../context/CartContext'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
