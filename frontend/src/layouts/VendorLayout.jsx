// =============================================
// components/common/ProtectedRoute.jsx - FIXED
// =============================================
// Now also handles unapproved vendor redirection

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isVendor } = useAuth()
  const location = useLocation()

  // ── Not logged in → redirect to login ────────
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // ── Determine actual role ─────────────────────
  const userRole = isVendor ? 'vendor' : user?.role

  // ── Wrong role → redirect to own dashboard ───
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin')   return <Navigate to="/admin/dashboard"   replace />
    if (userRole === 'vendor')  return <Navigate to="/vendor/dashboard"  replace />
    if (userRole === 'student') return <Navigate to="/student/dashboard" replace />
    return <Navigate to="/" replace />
  }

  // ── VENDOR APPROVAL CHECK ─────────────────────
  // If this is a vendor route and vendor is NOT approved,
  // only allow access to /vendor/dashboard and /vendor/profile
  // Block all other vendor routes
  if (userRole === 'vendor' && !user?.isApproved) {
    const allowedUnapprovedPaths = [
      '/vendor/dashboard',
      '/vendor/profile',
    ]

    const currentPath = location.pathname

    // Check if current path is allowed for unapproved vendors
    const isAllowed = allowedUnapprovedPaths.some((p) =>
      currentPath.startsWith(p)
    )

    if (!isAllowed) {
      // Redirect unapproved vendor back to dashboard
      // Dashboard shows the "pending approval" message
      return <Navigate to="/vendor/dashboard" replace />
    }
  }

  // ── All checks passed → render the page ──────
  return children
}

export default ProtectedRoute