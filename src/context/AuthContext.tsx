import { createContext, useState, useContext } from 'react'
import { Navigate } from 'react-router-dom'

interface User {
  role?: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (token: string, user?: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken')
  )
  const [user, setUser] = useState<User | null>(getStoredUser)

  const login = (token: string, user?: User) => {
    localStorage.setItem('authToken', token)
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      if (user.role) localStorage.setItem('userRole', user.role)
      setUser(user)
    }
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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

  if (requiredRoles.length > 0) {
    const userRole = user?.role ?? localStorage.getItem('userRole')
    const hasRequiredRole = requiredRoles.some(role => role === userRole)

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}