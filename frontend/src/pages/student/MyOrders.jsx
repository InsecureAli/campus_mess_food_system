// =============================================
// pages/student/MyOrders.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdRefresh, MdCancel } from 'react-icons/md'
import { orderService } from '../../services/orderService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',    emoji: '⏳' },
  accepted:  { label: 'Accepted',  color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',       emoji: '✅' },
  preparing: { label: 'Preparing', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', emoji: '👨‍🍳' },
  ready:     { label: 'Ready!',    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', emoji: '🔔' },
  completed: { label: 'Completed', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',    emoji: '✓' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',       emoji: '✗' },
  rejected:  { label: 'Rejected',  color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',       emoji: '✗' },
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await orderService.getMyOrders({ limit: 50 })
      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId) => {
    setCancellingId(orderId)
    try {
      await orderService.cancelOrder(orderId, { reason: 'Cancelled by student' })
      toast.success('Order cancelled')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel this order')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            My Orders 📋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track all your food orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 bg-slate-800 border border-slate-700
                     rounded-xl text-slate-400 hover:text-white
                     transition-colors"
        >
          <MdRefresh size={20} />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'accepted', 'preparing', 'ready',
          'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium
                        whitespace-nowrap transition-all duration-200
                        ${statusFilter === s
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
          >
            {s === 'all' ? 'All Orders' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" text="Loading orders..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No orders found
          </h3>
          <p className="text-slate-400 text-sm">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet"
              : `No ${STATUS_CONFIG[statusFilter]?.label} orders`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700/50
                             rounded-2xl p-6"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{cfg.emoji}</span>
                        <span className={`text-xs font-medium px-2.5 py-1
                                          rounded-full border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-white font-semibold">
                        {order.vendor?.messName || 'Campus Mess'}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-400 font-bold text-lg">
                        ₹{order.totalPrice?.toFixed(2)}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Online'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx}
                           className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.title} × {item.quantity}
                        </span>
                        <span className="text-slate-400">
                          ₹{item.subtotal?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special instructions */}
                  {order.specialInstructions && (
                    <p className="text-slate-400 text-xs italic mb-4
                                  bg-slate-700/30 rounded-lg px-3 py-2">
                      📝 {order.specialInstructions}
                    </p>
                  )}

                  {/* Actions */}
                  {['pending', 'accepted'].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      disabled={cancellingId === order._id}
                      className="flex items-center gap-1.5 text-rose-400
                                 hover:text-rose-300 text-sm font-medium
                                 transition-colors"
                    >
                      <MdCancel size={16} />
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default MyOrders