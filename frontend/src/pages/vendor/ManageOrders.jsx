// =============================================
// pages/vendor/ManageOrders.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdRefresh, MdCheckCircle, MdCancel,
  MdLocalShipping, MdRestaurant, MdDone
} from 'react-icons/md'
import { orderService } from '../../services/orderService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

// Status flow configuration
const STATUS_CONFIG = {
  pending:   {
    label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    emoji: '⏳', next: 'accepted', nextLabel: 'Accept Order'
  },
  accepted:  {
    label: 'Accepted', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    emoji: '✅', next: 'preparing', nextLabel: 'Start Preparing'
  },
  preparing: {
    label: 'Preparing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    emoji: '👨‍🍳', next: 'ready', nextLabel: 'Mark Ready'
  },
  ready:     {
    label: 'Ready!', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    emoji: '🔔', next: 'completed', nextLabel: 'Mark Completed'
  },
  completed: {
    label: 'Completed', color: 'text-slate-400 bg-slate-700/30 border-slate-600',
    emoji: '✓', next: null
  },
  cancelled: {
    label: 'Cancelled', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    emoji: '✗', next: null
  },
  rejected:  {
    label: 'Rejected', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    emoji: '✗', next: null
  },
}

// Individual Order Card Component
const OrderCard = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false)
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await orderService.updateOrderStatus(order._id, { status: newStatus })
      toast.success(`Order ${newStatus}!`)
      onStatusUpdate()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleReject = async () => {
    const reason = window.prompt('Reason for rejection (optional):')
    setUpdating(true)
    try {
      await orderService.updateOrderStatus(order._id, {
        status: 'rejected',
        cancellationReason: reason || 'Rejected by vendor',
      })
      toast.success('Order rejected')
      onStatusUpdate()
    } catch (error) {
      toast.error('Failed to reject order')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-slate-800/50 border rounded-2xl p-5
                  transition-colors duration-300
                  ${order.status === 'pending'
                    ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : order.status === 'ready'
                      ? 'border-emerald-500/30'
                      : 'border-slate-700/50'
                  }`}
    >
      {/* Order Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{cfg.emoji}</span>
            <span className={`text-xs font-semibold px-2.5 py-1
                              rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            {order.status === 'pending' && (
              <span className="animate-pulse text-xs text-amber-400
                               font-medium">
                NEW
              </span>
            )}
          </div>

          {/* Student info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full
                            flex items-center justify-center
                            text-indigo-400 font-bold text-sm">
              {order.student?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {order.student?.name}
              </p>
              <p className="text-slate-400 text-xs">
                {order.student?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Price & Time */}
        <div className="text-right flex-shrink-0">
          <p className="text-amber-400 font-bold text-xl">
            ₹{order.totalPrice?.toFixed(2)}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            {new Date(order.orderDate).toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {order.pickupTime && (
            <p className="text-indigo-400 text-xs mt-0.5">
              🕐 Pickup: {order.pickupTime}
            </p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-slate-700/30 rounded-xl p-4 mb-4 space-y-2">
        {order.items?.map((item, idx) => (
          <div key={idx}
               className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">×{item.quantity}</span>
              <span className="text-slate-200">{item.title}</span>
            </div>
            <span className="text-slate-300 font-medium">
              ₹{item.subtotal?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="bg-amber-500/5 border border-amber-500/20
                        rounded-xl px-4 py-2.5 mb-4">
          <p className="text-amber-300 text-xs">
            📝 <span className="font-medium">Note: </span>
            {order.specialInstructions}
          </p>
        </div>
      )}

      {/* Payment info */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2.5 py-1 rounded-full border
                          ${order.paymentStatus === 'paid'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-slate-400 bg-slate-700/30 border-slate-600'
                          }`}>
          {order.paymentStatus === 'paid' ? '✅ Paid' : '💵 Pay on Pickup'}
        </span>
        <span className="text-slate-400 text-xs capitalize">
          {order.paymentMethod}
        </span>
      </div>

      {/* Action Buttons */}
      {!['completed', 'cancelled', 'rejected'].includes(order.status) && (
        <div className="flex gap-2">
          {/* Reject button (shown for pending/accepted) */}
          {['pending', 'accepted'].includes(order.status) && (
            <button
              onClick={handleReject}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2.5
                         bg-rose-500/10 hover:bg-rose-500/20
                         text-rose-400 rounded-xl text-sm font-medium
                         border border-rose-500/30 transition-colors"
            >
              <MdCancel size={16} />
              Reject
            </button>
          )}

          {/* Next status button */}
          {cfg.next && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusUpdate(cfg.next)}
              disabled={updating}
              className={`flex-1 flex items-center justify-center
                          gap-2 py-2.5 rounded-xl text-sm font-semibold
                          text-white transition-all
                          ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                          ${order.status === 'pending' ? 'bg-emerald-500 hover:bg-emerald-600' :
                            order.status === 'accepted' ? 'bg-purple-500 hover:bg-purple-600' :
                            order.status === 'preparing' ? 'bg-blue-500 hover:bg-blue-600' :
                            'bg-amber-500 hover:bg-amber-600'
                          }`}
            >
              {updating ? (
                <Loader size="sm" text="" />
              ) : (
                <>
                  {order.status === 'pending'   && <MdCheckCircle size={16} />}
                  {order.status === 'accepted'  && <MdRestaurant size={16} />}
                  {order.status === 'preparing' && <MdLocalShipping size={16} />}
                  {order.status === 'ready'     && <MdDone size={16} />}
                  {cfg.nextLabel}
                </>
              )}
            </motion.button>
          )}
        </div>
      )}

      {/* Completed/Cancelled display */}
      {['completed', 'cancelled', 'rejected'].includes(order.status) && (
        <div className={`text-center py-2 rounded-xl text-sm font-medium
                         ${order.status === 'completed'
                           ? 'text-emerald-400 bg-emerald-500/5'
                           : 'text-rose-400 bg-rose-500/5'
                         }`}>
          {order.status === 'completed' ? '✅ Order Completed' :
           order.status === 'cancelled' ? '❌ Cancelled by Student' :
           '❌ Order Rejected'}
        </div>
      )}
    </motion.div>
  )
}

// ── MAIN PAGE ────────────────────────────────
const ManageOrders = () => {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [dateFilter, setDateFilter]   = useState(
    new Date().toISOString().split('T')[0]
  )
  const [total, setTotal]             = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, dateFilter])

  // Auto-refresh every 30 seconds for pending orders
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (dateFilter) params.date = dateFilter

      const response = await orderService.getVendorOrders(params)
      if (response.data.success) {
        setOrders(response.data.orders)
        setTotal(response.data.total)
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const statusTabs = [
    { id: 'all',       label: 'All'       },
    { id: 'pending',   label: 'Pending'   },
    { id: 'accepted',  label: 'Accepted'  },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready',     label: 'Ready'     },
    { id: 'completed', label: 'Done'      },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start
                      sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Manage Orders 📋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {total} orders {statusFilter !== 'all' ? `(${statusFilter})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl
                       px-3 py-2.5 text-white text-sm focus:outline-none
                       focus:border-amber-500"
          />

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium
                        border transition-all
                        ${autoRefresh
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
          >
            {autoRefresh ? '🔄 Live' : '🔄 Auto'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-800 border border-slate-700
                       rounded-xl text-slate-400 hover:text-white
                       transition-colors"
          >
            <MdRefresh size={20} />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium
                        whitespace-nowrap flex-shrink-0 transition-all
                        ${statusFilter === tab.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
          >
            {tab.label}
            {tab.id === 'pending' && orders.filter(o =>
              o.status === 'pending'
            ).length > 0 && statusFilter !== 'pending' && (
              <span className="ml-1.5 bg-rose-500 text-white text-xs
                               w-5 h-5 rounded-full inline-flex items-center
                               justify-center font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" text="Loading orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl
                        border border-dashed border-slate-700">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Orders
          </h3>
          <p className="text-slate-400 text-sm">
            No {statusFilter === 'all' ? '' : statusFilter} orders for this date
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ManageOrders