// =============================================
// pages/admin/ManageVendors.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MdSearch, MdRefresh, MdCheckCircle,
  MdCancel, MdStore, MdBlock
} from 'react-icons/md'
import { adminService } from '../../services/adminService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const ManageVendors = () => {
  const [vendors, setVendors]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [actionId, setActionId]   = useState(null)

  useEffect(() => {
    fetchVendors()
  }, [filter])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'approved')   params.isApproved = true
      if (filter === 'pending')    params.isApproved = false
      if (search)                  params.search = search

      const response = await adminService.getAllVendors(params)
      if (response.data.success) {
        setVendors(response.data.vendors)
      }
    } catch (error) {
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchVendors()
  }

  const handleApprove = async (vendorId, isApproved, vendorName) => {
    setActionId(vendorId)
    try {
      await adminService.approveVendor(vendorId, { isApproved })
      toast.success(
        isApproved
          ? `${vendorName} approved! ✅`
          : `${vendorName} approval revoked`
      )
      fetchVendors()
    } catch (error) {
      toast.error('Action failed')
    } finally {
      setActionId(null)
    }
  }

  const filterTabs = [
    { id: 'all',      label: 'All Vendors' },
    { id: 'pending',  label: '⏳ Pending'   },
    { id: 'approved', label: '✅ Approved'   },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Manage Vendors 🏪
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Approve and manage mess vendors
          </p>
        </div>
        <button
          onClick={fetchVendors}
          className="p-3 bg-slate-800 border border-slate-700
                     rounded-xl text-slate-400 hover:text-white
                     transition-colors"
        >
          <MdRefresh size={20} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium
                        border transition-all
                        ${filter === tab.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-slate-400" size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full bg-slate-800 border border-slate-700
                     rounded-xl pl-11 pr-4 py-3 text-white text-sm
                     placeholder-slate-500 focus:outline-none
                     focus:border-rose-500 transition-colors"
        />
      </form>

      {/* Vendors Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" text="Loading vendors..." />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl
                        border border-dashed border-slate-700">
          <div className="text-6xl mb-4">🏪</div>
          <p className="text-slate-400 text-sm">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vendors.map((vendor, i) => (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-slate-800/50 border rounded-2xl p-6
                          transition-all duration-300
                          ${vendor.isApproved
                            ? 'border-slate-700/50'
                            : 'border-amber-500/30'
                          }`}
            >
              {/* Vendor Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br
                                from-amber-500 to-orange-600
                                rounded-2xl flex items-center
                                justify-center text-2xl flex-shrink-0">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg
                                 leading-tight truncate">
                    {vendor.vendorName}
                  </h3>
                  <p className="text-amber-400 text-sm font-medium
                                flex items-center gap-1">
                    <MdStore size={14} />
                    {vendor.messName}
                  </p>
                  <p className="text-slate-400 text-xs truncate mt-0.5">
                    {vendor.email}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5 text-sm">
                {vendor.phone && (
                  <p className="text-slate-400 text-xs">
                    📱 {vendor.phone}
                  </p>
                )}
                {vendor.address && (
                  <p className="text-slate-400 text-xs truncate">
                    📍 {vendor.address}
                  </p>
                )}
                <p className="text-slate-400 text-xs">
                  🕐 {vendor.openingTime} – {vendor.closingTime}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-slate-400 text-xs">
                    Orders: <span className="text-white font-medium">
                      {vendor.totalOrders}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    Revenue: <span className="text-emerald-400 font-medium">
                      ₹{vendor.totalEarnings?.toFixed(0) || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-2.5 py-1
                                  rounded-full border
                                  ${vendor.isApproved
                                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                  }`}>
                  {vendor.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
                <span className="text-slate-500 text-xs">
                  Joined {new Date(vendor.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!vendor.isApproved ? (
                  // Approve button for pending vendors
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(
                      vendor._id, true, vendor.vendorName
                    )}
                    disabled={actionId === vendor._id}
                    className="flex-1 flex items-center justify-center
                               gap-2 py-2.5 bg-emerald-500
                               hover:bg-emerald-600 text-white rounded-xl
                               text-sm font-semibold transition-colors"
                  >
                    {actionId === vendor._id ? (
                      <Loader size="sm" text="" />
                    ) : (
                      <><MdCheckCircle size={16} /> Approve</>
                    )}
                  </motion.button>
                ) : (
                  // Revoke button for approved vendors
                  <button
                    onClick={() => handleApprove(
                      vendor._id, false, vendor.vendorName
                    )}
                    disabled={actionId === vendor._id}
                    className="flex-1 flex items-center justify-center
                               gap-2 py-2.5 bg-amber-500/10
                               hover:bg-amber-500/20 text-amber-400
                               rounded-xl text-sm font-medium border
                               border-amber-500/30 transition-colors"
                  >
                    <MdCancel size={16} />
                    Revoke Approval
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageVendors