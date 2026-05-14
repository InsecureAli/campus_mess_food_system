// =============================================
// components/common/ProtectedRoute.jsx
// =============================================
// Guards routes that require authentication
// Redirects unauthenticated users to login
// Redirects wrong-role users to their dashboard

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isVendor } = useAuth()
  const location = useLocation()

  // If not logged in → redirect to login
  // Pass current location so we can redirect back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Determine user's actual role
  const userRole = isVendor ? 'vendor' : user?.role

  // If role doesn't match allowed roles → redirect to correct dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (userRole === 'vendor') return <Navigate to="/vendor/dashboard" replace />
    if (userRole === 'student') return <Navigate to="/student/dashboard" replace />
    return <Navigate to="/" replace />
  }

  // User is authenticated and has correct role
  return children
}

export default ProtectedRoute