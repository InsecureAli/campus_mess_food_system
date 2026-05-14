// =============================================
// layouts/VendorLayout.jsx
// =============================================

import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdRestaurantMenu, MdReceipt,
  MdPerson, MdLogout, MdMenu, MdClose,
  MdStore, MdNotifications
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext.jsx'

const navLinks = [
  { path: '/vendor/dashboard', icon: MdDashboard,        label: 'Dashboard' },
  { path: '/vendor/menu',      icon: MdRestaurantMenu,   label: 'Manage Menu' },
  { path: '/vendor/orders',    icon: MdReceipt,          label: 'Orders' },
  { path: '/vendor/profile',   icon: MdPerson,           label: 'Profile' },
]

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500
                          to-orange-600 rounded-xl flex items-center
                          justify-center text-white font-bold text-lg">
            🏪
          </div>
          <div>
            <p className="text-white font-bold text-sm">Vendor Portal</p>
            <p className="text-slate-400 text-xs">Campus Mess</p>
          </div>
        </div>
      </div>

      {/* Vendor Info */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-full flex
                          items-center justify-center text-white
                          font-semibold text-sm">
            {user?.vendorName?.charAt(0)?.toUpperCase() || 'V'}
          </div>
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[130px]">
              {user?.vendorName}
            </p>
            <div className="flex items-center gap-1">
              <MdStore size={12} className="text-amber-400" />
              <p className="text-amber-400 text-xs truncate max-w-[100px]">
                {user?.messName}
              </p>
            </div>
          </div>
        </div>

        {/* Approval Status Badge */}
        {!user?.isApproved && (
          <div className="mt-3 px-3 py-1.5 bg-amber-500/10 border
                          border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-xs text-center">
              ⏳ Pending Admin Approval
            </p>
          </div>
        )}
      </div>

      {/* Nav Links */}
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
                 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
               }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-800/50
                        border-r border-slate-700/50 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 w-64 h-full bg-slate-800
                         border-r border-slate-700/50 z-50 lg:hidden"
            >
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

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-slate-900/80
                           backdrop-blur-md border-b border-slate-700/50
                           px-4 lg:px-8 py-4 flex items-center
                           justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <MdMenu size={24} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400
                               hover:text-white hover:bg-slate-700/50
                               rounded-xl transition-colors">
              <MdNotifications size={22} />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500
                            to-orange-600 rounded-full flex items-center
                            justify-center text-white font-semibold text-sm">
              {user?.vendorName?.charAt(0)?.toUpperCase() || 'V'}
            </div>
          </div>
        </header>

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

export default VendorLayout