import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, session } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && session?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute


