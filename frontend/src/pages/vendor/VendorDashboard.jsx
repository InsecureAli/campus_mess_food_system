// =============================================
// pages/vendor/VendorDashboard.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdReceipt, MdAttachMoney, MdPeople, MdRestaurantMenu,
  MdArrowForward, MdTrendingUp
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import { orderService } from '../../services/orderService.js'
import { menuService } from '../../services/menuService.js'
import StatCard from '../../components/common/StatCard.jsx'
import Loader from '../../components/common/Loader.jsx'

const STATUS_COLORS = {
  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  accepted:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  preparing: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  ready:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  completed: 'text-slate-400 bg-slate-700/30 border-slate-600/30',
  cancelled: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
}

const VendorDashboard = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [menuCount, setMenuCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0,
    todayRevenue: 0, totalRevenue: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        orderService.getVendorOrders({ limit: 8 }),
        menuService.getVendorMenu(),
      ])

      if (ordersRes.data.success) {
        const allOrders = ordersRes.data.orders
        setOrders(allOrders.slice(0, 6))

        // Calculate stats
        const today = new Date().toDateString()
        const todayRevenue = allOrders
          .filter(o =>
            o.status === 'completed' &&
            new Date(o.orderDate).toDateString() === today
          )
          .reduce((sum, o) => sum + o.totalPrice, 0)

        setStats({
          totalOrders:  ordersRes.data.total || 0,
          pendingOrders: allOrders.filter(o => o.status === 'pending').length,
          todayRevenue,
          totalRevenue: user?.totalEarnings || 0,
        })
      }

      if (menuRes.data.success) {
        setMenuCount(menuRes.data.count)
      }
    } catch (error) {
      console.error('Vendor dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  // Show approval pending message
  if (!user?.isApproved) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[60vh] text-center space-y-4">
        <div className="text-7xl">⏳</div>
        <h2 className="text-2xl font-bold text-white">
          Account Pending Approval
        </h2>
        <p className="text-slate-400 max-w-md">
          Your vendor account is awaiting admin approval.
          You'll be notified once approved. Please check back later.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30
                        rounded-2xl px-8 py-4">
          <p className="text-amber-400 text-sm">
            📧 {user?.email}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome, {user?.vendorName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            🏪 {user?.messName} — Dashboard Overview
          </p>
        </div>
        <Link
          to="/vendor/menu"
          className="flex items-center gap-2 bg-amber-500
                     hover:bg-amber-600 text-white px-5 py-2.5
                     rounded-xl text-sm font-medium transition-colors"
        >
          <MdRestaurantMenu size={18} />
          Add Menu
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders"   value={stats.totalOrders}
                  icon={MdReceipt}        color="amber"   delay={0} />
        <StatCard title="Pending"         value={stats.pendingOrders}
                  icon={MdPeople}         color="rose"    delay={0.1} />
        <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue.toFixed(0)}`}
                  icon={MdAttachMoney}    color="emerald" delay={0.2} />
        <StatCard title="Menu Items"      value={menuCount}
                  icon={MdRestaurantMenu} color="purple"  delay={0.3} />
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-2xl border
                   border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Recent Orders</h2>
          <Link
            to="/vendor/orders"
            className="text-amber-400 hover:text-amber-300 text-sm
                       font-medium flex items-center gap-1"
          >
            Manage All <MdArrowForward size={16} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-slate-400 text-sm">No orders received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700/50">
                  {['Student', 'Items', 'Total', 'Status', 'Time'].map(h => (
                    <th key={h} className="pb-3 text-xs font-semibold
                                           text-slate-400 uppercase tracking-wider
                                           pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {orders.map((order) => (
                  <tr key={order._id}
                      className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-white text-sm font-medium">
                        {order.student?.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {order.student?.email}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-slate-300 text-sm">
                        {order.items?.length} item(s)
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-amber-400 font-semibold text-sm">
                        ₹{order.totalPrice?.toFixed(2)}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs font-medium px-2.5 py-1
                                        rounded-full border capitalize
                                        ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">
                      {new Date(order.orderDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default VendorDashboard