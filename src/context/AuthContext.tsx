import { createContext, useEffect, useState, useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe, type AuthUser } from '../services/auth'

interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken')
  )
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  const login = (token: string, user: AuthUser) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const refreshUser = async () => {
    const freshUser = await getMe()
    localStorage.setItem('user', JSON.stringify(freshUser))
    setUser(freshUser)
  }

  useEffect(() => {
    if (!isAuthenticated) return

    getMe()
      .then(freshUser => {
        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
      })
      .catch(() => logout())
    // Revalida a sessão uma vez no boot do app — se o token expirou, o backend
    // responde 401 e derrubamos a sessão local em vez de deixar o usuário preso
    // numa tela protegida com dados stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

// ProtectedRoute simplificada com Context
export function ProtectedRoute({
  children,
  requiredRoles = []
}: {
  children: React.ReactNode
  requiredRoles?: string[]
}) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.mustChangePassword && window.location.pathname !== '/primeiro-acesso') {
    return <Navigate to="/primeiro-acesso" replace />
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => role === user?.papel)
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}