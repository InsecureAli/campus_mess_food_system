// =============================================
// routes/AppRoutes.jsx - All Application Routes
// =============================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ── Layouts ───────────────────────────────────
import StudentLayout from '../layouts/StudentLayout.jsx'
import VendorLayout from '../layouts/VendorLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

// ── Auth Pages ────────────────────────────────
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'

// ── Public Pages ──────────────────────────────
import Home from '../pages/Home.jsx'
import NotFound from '../pages/NotFound.jsx'

// ── Student Pages ─────────────────────────────
import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import Menu from '../pages/student/Menu.jsx'
import Cart from '../pages/student/Cart.jsx'
import MyOrders from '../pages/student/MyOrders.jsx'
import Profile from '../pages/student/Profile.jsx'

// ── Vendor Pages ──────────────────────────────
import VendorDashboard from '../pages/vendor/VendorDashboard.jsx'
import ManageMenu from '../pages/vendor/ManageMenu.jsx'
import ManageOrders from '../pages/vendor/ManageOrders.jsx'
import VendorProfile from '../pages/vendor/VendorProfile.jsx'

// ── Admin Pages ───────────────────────────────
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import ManageUsers from '../pages/admin/ManageUsers.jsx'
import ManageVendors from '../pages/admin/ManageVendors.jsx'
import AdminOrders from '../pages/admin/AdminOrders.jsx'

// ── Protected Route Component ─────────────────
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'

// ── Loading Spinner ───────────────────────────
import Loader from '../components/common/Loader.jsx'

// =============================================
// MAIN ROUTES COMPONENT
// =============================================
const AppRoutes = () => {
  const { loading } = useAuth()

  // Show loading spinner while checking auth status
  // This prevents flash of wrong content on page refresh
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center
                      bg-slate-900">
        <Loader size="lg" text="Loading Campus Mess System..." />
      </div>
    )
  }

  return (
    <Routes>
      {/* ════════════════════════════════════════
          PUBLIC ROUTES (No auth required)
          ════════════════════════════════════════ */}

      {/* Home/Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ════════════════════════════════════════
          STUDENT ROUTES (Role: student)
          ════════════════════════════════════════ */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        {/* /student → redirect to /student/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="menu" element={<Menu />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ════════════════════════════════════════
          VENDOR ROUTES (Role: vendor)
          ════════════════════════════════════════ */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="menu" element={<ManageMenu />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="profile" element={<VendorProfile />} />
      </Route>

      {/* ════════════════════════════════════════
          ADMIN ROUTES (Role: admin)
          ════════════════════════════════════════ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="vendors" element={<ManageVendors />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* ════════════════════════════════════════
          404 NOT FOUND
          ════════════════════════════════════════ */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes