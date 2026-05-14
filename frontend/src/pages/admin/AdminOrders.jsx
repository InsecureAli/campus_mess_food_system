// =============================================
// pages/admin/AdminOrders.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdRefresh, MdSearch } from 'react-icons/md'
import { adminService } from '../../services/adminService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  accepted:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  preparing: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  ready:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  completed: 'text-slate-400 bg-slate-700/30 border-slate-600',
  cancelled: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  rejected:  'text-rose-400 bg-rose-500/10 border-rose-500/30',
}

const AdminOrders = () => {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminService.getAllOrders(params)
      if (response.data.success) {
        setOrders(response.data.orders)
        setTotalPages(response.data.pages || 1)
        setTotal(response.data.total || 0)
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const statusTabs = [
    'all', 'pending', 'accepted', 'preparing',
    'ready', 'completed', 'cancelled',
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            All Orders 📋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} total orders in the system
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
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium
                        whitespace-nowrap flex-shrink-0 border
                        transition-all capitalize
                        ${statusFilter === s
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
          >
            {s === 'all' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-700/50
                   rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30 border-b border-slate-700/50">
                <tr>
                  {['#', 'Student', 'Vendor', 'Items', 'Total',
                    'Status', 'Payment', 'Date'].map((h) => (
                    <th key={h}
                        className="text-left px-5 py-4 text-xs font-semibold
                                   text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {orders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {(page - 1) * 20 + i + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">
                        {order.student?.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {order.student?.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm">
                        {order.vendor?.messName}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-slate-300 text-sm">
                        {order.items?.length} item(s)
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-emerald-400 font-bold text-sm">
                        ₹{order.totalPrice?.toFixed(2)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1
                                        rounded-full border capitalize
                                        ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1
                                        rounded-full border
                                        ${order.paymentStatus === 'paid'
                                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                          : 'text-slate-400 bg-slate-700/30 border-slate-600'
                                        }`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(order.orderDate).toLocaleDateString('en-IN')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2
                          p-4 border-t border-slate-700/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl
                         text-sm disabled:opacity-40 hover:bg-slate-600
                         transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm px-3">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl
                         text-sm disabled:opacity-40 hover:bg-slate-600
                         transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AdminOrders