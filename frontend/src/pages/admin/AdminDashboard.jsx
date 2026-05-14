// =============================================
// pages/admin/AdminDashboard.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts'
import {
  MdPeople, MdStore, MdReceipt, MdAttachMoney,
  MdPending, MdCheckCircle, MdTrendingUp,
  MdRestaurantMenu
} from 'react-icons/md'
import { adminService } from '../../services/adminService.js'
import StatCard from '../../components/common/StatCard.jsx'
import Loader from '../../components/common/Loader.jsx'

// Month names for chart labels
const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

// Colors for pie chart
const PIE_COLORS = {
  pending:   '#F59E0B',
  accepted:  '#3B82F6',
  preparing: '#8B5CF6',
  ready:     '#10B981',
  completed: '#64748B',
  cancelled: '#EF4444',
  rejected:  '#EF4444',
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl
                      px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold text-sm"
             style={{ color: entry.color }}>
            {entry.name}: {
              entry.name.includes('Revenue') || entry.name.includes('₹')
                ? `₹${entry.value}`
                : entry.value
            }
          </p>
        ))}
      </div>
    )
  }
  return null
}

const AdminDashboard = () => {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await adminService.getStats()
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Admin stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" text="Loading admin dashboard..." />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-slate-400">
        Failed to load dashboard data
      </div>
    )
  }

  // Prepare monthly revenue data for charts
  const revenueChartData = stats.monthlyRevenue?.map((item) => ({
    month: MONTH_NAMES[(item._id.month - 1)],
    revenue: item.revenue,
    orders: item.orders,
  })) || []

  // Prepare order status data for pie chart
  const statusPieData = stats.ordersByStatus?.map((item) => ({
    name:  item._id,
    value: item.count,
    color: PIE_COLORS[item._id] || '#6366F1',
  })) || []

  return (
    <div className="space-y-8">

      {/* ── PAGE HEADER ──────────────────────── */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Admin Dashboard 🛡️
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          System overview and analytics
        </p>
      </div>

      {/* ── TOP STATS ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={MdPeople}
          color="indigo"
          delay={0}
        />
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={MdStore}
          color="amber"
          delay={0.1}
          subtitle={`${stats.pendingVendors} pending`}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={MdReceipt}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue?.toFixed(0) || 0}`}
          icon={MdAttachMoney}
          color="emerald"
          delay={0.3}
        />
      </div>

      {/* ── SECONDARY STATS ──────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Menu Items"
          value={stats.totalMenuItems}
          icon={MdRestaurantMenu}
          color="cyan"
          delay={0.1}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingVendors}
          icon={MdPending}
          color="amber"
          delay={0.2}
          subtitle="Vendors waiting"
        />
        <StatCard
          title="Active System"
          value="Online ✅"
          icon={MdCheckCircle}
          color="emerald"
          delay={0.3}
        />
      </div>

      {/* ── CHARTS ROW ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart - 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-800/50 border
                     border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Revenue Overview
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Last 6 months
              </p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <MdTrendingUp size={18} />
              <span className="text-sm font-medium">Monthly</span>
            </div>
          </div>

          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueChartData}>
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="₹ Revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#ordersGradient)"
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">
                No revenue data available yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Order Status Pie Chart - 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700/50
                     rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">
            Orders by Status
          </h2>

          {statusPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#F1F5F9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-4">
                {statusPieData.map((item) => (
                  <div key={item.name}
                       className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                           style={{ background: item.color }} />
                      <span className="text-slate-400 text-xs capitalize">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-white text-xs font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">No order data</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── RECENT ORDERS TABLE ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 border border-slate-700/50
                   rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-6">
          Recent Orders
        </h2>

        {stats.recentOrders?.length === 0 ? (
          <p className="text-slate-400 text-center py-8 text-sm">
            No orders yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Student', 'Vendor', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h}
                        className="text-left pb-3 text-xs font-semibold
                                   text-slate-400 uppercase tracking-wider pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {stats.recentOrders?.map((order) => (
                  <tr key={order._id}
                      className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="text-white text-sm font-medium">
                        {order.student?.name}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-slate-300 text-sm">
                        {order.vendor?.messName}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-emerald-400 font-semibold text-sm">
                        ₹{order.totalPrice?.toFixed(2)}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs font-medium px-2.5 py-1
                                        rounded-full border capitalize
                                        ${PIE_COLORS[order.status]
                                          ? `border-current`
                                          : ''
                                        }`}
                            style={{
                              color: PIE_COLORS[order.status],
                              borderColor: PIE_COLORS[order.status] + '50',
                              background: PIE_COLORS[order.status] + '15',
                            }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">
                      {new Date(order.orderDate).toLocaleDateString('en-IN')}
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

export default AdminDashboard