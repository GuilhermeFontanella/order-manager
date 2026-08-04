import './App.css'
import { AuthProvider } from '../context/AuthContext'
import { AppRoutes } from '../routes'
import { CartProvider } from '../context/CartContext'
import CookieConsentBanner from '../components/CookieConsentBanner'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <CookieConsentBanner />
      </CartProvider>
    </AuthProvider>
  )
}
