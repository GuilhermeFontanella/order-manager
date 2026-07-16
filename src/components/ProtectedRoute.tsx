import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean
  requiredRoles?: string[]
  userRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  isAuthenticated,
  requiredRoles = [],
  userRoles = [],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Verificar permissões/roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role =>
      userRoles.includes(role)
    )
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}