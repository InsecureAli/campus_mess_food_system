// =============================================
// layouts/StudentLayout.jsx
// =============================================
// Wraps all student pages with sidebar + topbar

import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdRestaurantMenu, MdShoppingCart,
  MdReceipt, MdPerson, MdLogout, MdMenu, MdClose,
  MdNotifications
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

// Navigation links for student sidebar
const navLinks = [
  { path: '/student/dashboard', icon: MdDashboard,       label: 'Dashboard' },
  { path: '/student/menu',      icon: MdRestaurantMenu,  label: 'Browse Menu' },
  { path: '/student/cart',      icon: MdShoppingCart,    label: 'My Cart' },
  { path: '/student/orders',    icon: MdReceipt,         label: 'My Orders' },
  { path: '/student/profile',   icon: MdPerson,          label: 'Profile' },
]

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Sidebar content (reused in mobile + desktop)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500
                          to-purple-600 rounded-xl flex items-center
                          justify-center text-white font-bold text-lg">
            🍽️
          </div>
          <div>
            <p className="text-white font-bold text-sm">Campus Mess</p>
            <p className="text-slate-400 text-xs">Food System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-full flex
                          items-center justify-center text-white
                          font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[130px]">
              {user?.name}
            </p>
            <p className="text-indigo-400 text-xs">Student</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl
               text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-indigo-400' : ''} />
                <span>{label}</span>
                {/* Cart badge */}
                {label === 'My Cart' && cartCount > 0 && (
                  <span className="ml-auto bg-indigo-500 text-white
                                   text-xs rounded-full w-5 h-5 flex
                                   items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3
                     rounded-xl text-sm font-medium text-slate-400
                     hover:text-rose-400 hover:bg-rose-500/10
                     transition-all duration-200"
        >
          <MdLogout size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex">

      {/* ── DESKTOP SIDEBAR ─────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-800/50
                        border-r border-slate-700/50 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />

            {/* Sliding sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 w-64 h-full bg-slate-800
                         border-r border-slate-700/50 z-50 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400
                           hover:text-white p-1"
              >
                <MdClose size={24} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ───────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-20 bg-slate-900/80
                           backdrop-blur-md border-b border-slate-700/50
                           px-4 lg:px-8 py-4 flex items-center
                           justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <MdMenu size={24} />
          </button>

          {/* Page title area (empty for dynamic titles in pages) */}
          <div className="hidden lg:block" />

          {/* Right side: notifications + avatar */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 text-slate-400
                               hover:text-white hover:bg-slate-700/50
                               rounded-xl transition-colors">
              <MdNotifications size={22} />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2
                               bg-indigo-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500
                            to-purple-600 rounded-full flex items-center
                            justify-center text-white font-semibold text-sm
                            cursor-pointer">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* Outlet renders the matched child route component */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default StudentLayout