import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  try {
    const { isAuthenticated, session } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    if (requiredRole && session?.role !== requiredRole) {
      return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(session?.role)) {
      return <Navigate to="/" replace />
    }

    return children
  } catch (error) {
    console.error('ProtectedRoute error:', error)
    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute


