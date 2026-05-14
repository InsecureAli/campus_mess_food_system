// =============================================
// pages/student/StudentDashboard.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdRestaurantMenu, MdShoppingCart, MdReceipt,
  MdCheckCircle, MdPending, MdLocalFireDepartment,
  MdArrowForward, MdStar
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { orderService } from '../../services/orderService.js'
import { menuService } from '../../services/menuService.js'
import StatCard from '../../components/common/StatCard.jsx'
import Loader from '../../components/common/Loader.jsx'

const StudentDashboard = () => {
  const { user } = useAuth()
  const { cartCount, cartTotal } = useCart()
  const [recentOrders, setRecentOrders] = useState([])
  const [todayMenu, setTodayMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [orderStats, setOrderStats] = useState({
    total: 0, pending: 0, completed: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        orderService.getMyOrders({ limit: 5 }),
        menuService.getMenuItems({ limit: 6 }),
      ])

      if (ordersRes.data.success) {
        const orders = ordersRes.data.orders
        setRecentOrders(orders)
        setOrderStats({
          total: ordersRes.data.total,
          pending:   orders.filter(o => ['pending','accepted','preparing'].includes(o.status)).length,
          completed: orders.filter(o => o.status === 'completed').length,
        })
      }

      if (menuRes.data.success) {
        setTodayMenu(menuRes.data.menuItems)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Order status badge
  const StatusBadge = ({ status }) => {
    const config = {
      pending:   { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',  label: 'Pending'   },
      accepted:  { color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',     label: 'Accepted'  },
      preparing: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', label: 'Preparing' },
      ready:     { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Ready!' },
      completed: { color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',  label: 'Done'      },
      cancelled: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',     label: 'Cancelled' },
      rejected:  { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',     label: 'Rejected'  },
    }
    const c = config[status] || config.pending
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                        border ${c.color}`}>
        {c.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── WELCOME HEADER ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center
                   justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' :
                  new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-indigo-400">
              {user?.name?.split(' ')[0]}! 👋
            </span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        <Link
          to="/student/menu"
          className="flex items-center gap-2 bg-indigo-500
                     hover:bg-indigo-600 text-white px-5 py-2.5
                     rounded-xl text-sm font-medium transition-colors
                     duration-200"
        >
          <MdRestaurantMenu size={18} />
          Browse Today's Menu
        </Link>
      </motion.div>

      {/* ── STATS CARDS ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={orderStats.total}
          icon={MdReceipt}
          color="indigo"
          subtitle="All time"
          delay={0}
        />
        <StatCard
          title="Active Orders"
          value={orderStats.pending}
          icon={MdPending}
          color="amber"
          subtitle="In progress"
          delay={0.1}
        />
        <StatCard
          title="Completed"
          value={orderStats.completed}
          icon={MdCheckCircle}
          color="emerald"
          subtitle="Successfully"
          delay={0.2}
        />
        <StatCard
          title="Cart Items"
          value={cartCount}
          icon={MdShoppingCart}
          color="purple"
          subtitle={`₹${cartTotal.toFixed(2)}`}
          delay={0.3}
        />
      </div>

      {/* ── MAIN CONTENT GRID ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders - takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-slate-800/50 rounded-2xl
                     border border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <Link
              to="/student/orders"
              className="text-indigo-400 hover:text-indigo-300 text-sm
                         font-medium flex items-center gap-1 transition-colors"
            >
              View All <MdArrowForward size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="text-slate-400 text-sm">No orders yet</p>
              <Link
                to="/student/menu"
                className="mt-3 inline-block text-indigo-400
                           hover:text-indigo-300 text-sm font-medium"
              >
                Browse the menu to start ordering
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4
                             bg-slate-700/30 rounded-xl hover:bg-slate-700/50
                             transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10
                                    rounded-xl flex items-center
                                    justify-center">
                      <MdReceipt className="text-indigo-400" size={20} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {order.vendor?.messName || 'Campus Mess'}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {order.items?.length} item(s) •{' '}
                        ₹{order.totalPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's Popular Items - 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-2xl border
                     border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MdLocalFireDepartment className="text-orange-400" size={22} />
              Today's Menu
            </h2>
            <Link
              to="/student/menu"
              className="text-indigo-400 hover:text-indigo-300
                         text-sm font-medium"
            >
              See all
            </Link>
          </div>

          {todayMenu.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                No menu available today
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayMenu.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3
                             bg-slate-700/30 rounded-xl"
                >
                  {/* Food image or emoji */}
                  <div className="w-10 h-10 bg-slate-700
                                  rounded-lg flex items-center
                                  justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api','')}${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        {item.category === 'Breakfast' ? '🍳' :
                         item.category === 'Lunch' ? '🍛' :
                         item.category === 'Dinner' ? '🍽️' :
                         item.category === 'Beverages' ? '☕' : '🍜'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.title}
                    </p>
                    <p className="text-indigo-400 text-xs font-semibold">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Veg/Non-veg indicator */}
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0
                                   flex items-center justify-center
                                   ${item.isVeg
                                     ? 'border-emerald-500'
                                     : 'border-rose-500'
                                   }`}>
                    <div className={`w-2 h-2 rounded-full
                                     ${item.isVeg
                                       ? 'bg-emerald-500'
                                       : 'bg-rose-500'
                                     }`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Order CTA */}
          <Link
            to="/student/menu"
            className="mt-5 flex items-center justify-center gap-2
                       w-full bg-indigo-500/10 hover:bg-indigo-500/20
                       border border-indigo-500/30 text-indigo-400
                       py-3 rounded-xl text-sm font-medium
                       transition-colors duration-200"
          >
            <MdRestaurantMenu size={18} />
            Order Now
          </Link>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/student/menu',    icon: '🍽️', label: 'Browse Menu',    color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
            { to: '/student/cart',    icon: '🛒', label: 'View Cart',      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
            { to: '/student/orders',  icon: '📋', label: 'My Orders',      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
            { to: '/student/profile', icon: '👤', label: 'My Profile',     color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`bg-gradient-to-br ${action.color} border
                          rounded-2xl p-5 flex flex-col items-center
                          gap-3 hover:scale-105 transition-transform
                          duration-200 cursor-pointer`}
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="text-white text-sm font-medium text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default StudentDashboard