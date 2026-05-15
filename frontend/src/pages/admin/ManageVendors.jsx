// =============================================
// pages/admin/ManageVendors.jsx - FIXED VERSION
// =============================================
// Now includes:
// ✅ Approve / Revoke approval
// ✅ Ban / Unban vendor
// ✅ Shows cascade effect in UI

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdSearch, MdRefresh, MdCheckCircle,
  MdCancel, MdStore, MdBlock, MdLockOpen,
  MdWarning, MdInfo
} from 'react-icons/md'
import { adminService } from '../../services/adminService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// Vendor Status Badge Component
// ─────────────────────────────────────────────
const VendorStatusBadge = ({ vendor }) => {
  if (vendor.isBanned) {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                       text-rose-400 bg-rose-500/10 border border-rose-500/30">
        🚫 Banned
      </span>
    )
  }
  if (vendor.isApproved) {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                       text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
        ✅ Approved
      </span>
    )
  }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                     text-amber-400 bg-amber-500/10 border border-amber-500/30">
      ⏳ Pending
    </span>
  )
}

// ─────────────────────────────────────────────
// Cascade Info Tooltip
// ─────────────────────────────────────────────
const CascadeNote = ({ visible }) => {
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-2 bg-blue-500/10 border
                 border-blue-500/30 rounded-xl p-3 mb-4"
    >
      <MdInfo className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
      <p className="text-blue-300 text-xs leading-relaxed">
        <span className="font-semibold">Cascade Effect Active: </span>
        When a vendor is revoked or banned, their menu items are
        automatically hidden from students and pending orders are cancelled.
      </p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Individual Vendor Card
// ─────────────────────────────────────────────
const VendorCard = ({ vendor, onAction }) => {
  const [actionLoading, setActionLoading] = useState(null)
  // null = idle, 'approve' = approving, 'revoke' = revoking, 'ban' = banning

  // Handle approve or revoke
  const handleApproval = async (approve) => {
    const actionKey = approve ? 'approve' : 'revoke'
    const confirmMsg = approve
      ? `Approve ${vendor.vendorName}? Their menu will become visible to students.`
      : `Revoke ${vendor.vendorName}'s approval?\n\n` +
        `⚠️ This will:\n` +
        `• Hide all their menu items from students\n` +
        `• Cancel all their pending orders`

    if (!window.confirm(confirmMsg)) return

    setActionLoading(actionKey)
    try {
      const response = await adminService.approveVendor(
        vendor._id,
        { isApproved: approve }
      )

      if (approve) {
        toast.success(`${vendor.vendorName} approved! Menu items now visible ✅`)
      } else {
        toast.success(
          `${vendor.vendorName} revoked. Menu hidden & orders cancelled ❌`,
          { duration: 5000 }
        )
      }

      onAction() // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle ban or unban
  const handleBan = async () => {
    const isBanning = !vendor.isBanned
    const confirmMsg = isBanning
      ? `Ban ${vendor.vendorName}?\n\n` +
        `⚠️ This will:\n` +
        `• Block their login access\n` +
        `• Hide all their menu items\n` +
        `• Cancel all pending orders`
      : `Unban ${vendor.vendorName}? They will regain access.`

    if (!window.confirm(confirmMsg)) return

    setActionLoading('ban')
    try {
      await adminService.toggleVendorBan(vendor._id)

      if (isBanning) {
        toast.success(
          `${vendor.vendorName} banned. Menu hidden & orders cancelled 🚫`,
          { duration: 5000 }
        )
      } else {
        toast.success(`${vendor.vendorName} unbanned ✅`)
      }

      onAction()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  // Card border color based on status
  const borderColor = vendor.isBanned
    ? 'border-rose-500/30'
    : vendor.isApproved
      ? 'border-emerald-500/20'
      : 'border-amber-500/30'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-slate-800/50 border ${borderColor}
                  rounded-2xl p-6 transition-all duration-300
                  ${vendor.isBanned ? 'opacity-75' : ''}`}
    >
      {/* ── VENDOR HEADER ──────────────────── */}
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center
                         justify-center text-2xl flex-shrink-0
                         ${vendor.isBanned
                           ? 'bg-rose-500/20'
                           : vendor.isApproved
                             ? 'bg-emerald-500/20'
                             : 'bg-amber-500/20'
                         }`}>
          {vendor.isBanned ? '🚫' : '🏪'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-white font-bold text-base leading-tight">
              {vendor.vendorName}
            </h3>
            <VendorStatusBadge vendor={vendor} />
          </div>
          <p className="text-amber-400 text-sm font-medium
                        flex items-center gap-1">
            <MdStore size={14} />
            {vendor.messName}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">
            {vendor.email}
          </p>
        </div>
      </div>

      {/* ── VENDOR DETAILS ─────────────────── */}
      <div className="space-y-1.5 mb-5 text-xs text-slate-400">
        {vendor.phone && (
          <p>📱 {vendor.phone}</p>
        )}
        {vendor.address && (
          <p className="truncate">📍 {vendor.address}</p>
        )}
        <p>🕐 {vendor.openingTime} – {vendor.closingTime}</p>
        <div className="flex items-center gap-4 pt-1">
          <span>
            Orders:{' '}
            <span className="text-white font-medium">
              {vendor.totalOrders || 0}
            </span>
          </span>
          <span>
            Revenue:{' '}
            <span className="text-emerald-400 font-medium">
              ₹{vendor.totalEarnings?.toFixed(0) || 0}
            </span>
          </span>
          <span>
            Rating:{' '}
            <span className="text-amber-400 font-medium">
              ⭐ {vendor.rating?.toFixed(1) || '0.0'}
            </span>
          </span>
        </div>
        <p className="text-slate-500">
          Joined {new Date(vendor.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>

      {/* ── WHAT HAPPENS NOTE ──────────────── */}
      {/* Show warning when vendor is approved (revoke will have impact) */}
      {vendor.isApproved && !vendor.isBanned && (
        <div className="flex items-start gap-2 bg-slate-700/30
                        rounded-xl p-3 mb-4">
          <MdInfo className="text-slate-400 flex-shrink-0 mt-0.5"
                  size={14} />
          <p className="text-slate-400 text-xs">
            Menu items are <span className="text-emerald-400 font-medium">
              visible
            </span> to students. Revoking will hide them instantly.
          </p>
        </div>
      )}

      {/* Show when vendor is NOT approved */}
      {!vendor.isApproved && !vendor.isBanned && (
        <div className="flex items-start gap-2 bg-amber-500/5
                        border border-amber-500/20 rounded-xl p-3 mb-4">
          <MdWarning className="text-amber-400 flex-shrink-0 mt-0.5"
                     size={14} />
          <p className="text-amber-400/80 text-xs">
            Menu items are <span className="text-rose-400 font-medium">
              hidden
            </span> from students until approved.
          </p>
        </div>
      )}

      {/* Show when vendor is banned */}
      {vendor.isBanned && (
        <div className="flex items-start gap-2 bg-rose-500/5
                        border border-rose-500/20 rounded-xl p-3 mb-4">
          <MdBlock className="text-rose-400 flex-shrink-0 mt-0.5"
                   size={14} />
          <p className="text-rose-400/80 text-xs">
            Vendor is banned. All menu items are hidden and
            login is blocked.
          </p>
        </div>
      )}

      {/* ── ACTION BUTTONS ─────────────────── */}
      <div className="space-y-2">

        {/* Approval buttons (only show if not banned) */}
        {!vendor.isBanned && (
          <div className="flex gap-2">
            {!vendor.isApproved ? (
              // APPROVE button
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApproval(true)}
                disabled={actionLoading !== null}
                className="flex-1 flex items-center justify-center
                           gap-2 py-2.5 bg-emerald-500
                           hover:bg-emerald-600 text-white rounded-xl
                           text-sm font-semibold transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'approve' ? (
                  <Loader size="sm" text="" />
                ) : (
                  <><MdCheckCircle size={16} /> Approve Vendor</>
                )}
              </motion.button>
            ) : (
              // REVOKE button
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApproval(false)}
                disabled={actionLoading !== null}
                className="flex-1 flex items-center justify-center
                           gap-2 py-2.5 bg-amber-500/10
                           hover:bg-amber-500/20 text-amber-400
                           rounded-xl text-sm font-medium
                           border border-amber-500/30 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'revoke' ? (
                  <Loader size="sm" text="" />
                ) : (
                  <><MdCancel size={16} /> Revoke Approval</>
                )}
              </motion.button>
            )}
          </div>
        )}

        {/* Ban / Unban button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBan}
          disabled={actionLoading !== null}
          className={`w-full flex items-center justify-center
                      gap-2 py-2.5 rounded-xl text-sm font-medium
                      border transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${vendor.isBanned
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
        >
          {actionLoading === 'ban' ? (
            <Loader size="sm" text="" />
          ) : vendor.isBanned ? (
            <><MdLockOpen size={16} /> Unban Vendor</>
          ) : (
            <><MdBlock size={16} /> Ban Vendor</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN MANAGE VENDORS PAGE
// ─────────────────────────────────────────────
const ManageVendors = () => {
  const [vendors, setVendors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [showCascadeNote, setShowCascadeNote] = useState(true)

  // Stats computed from vendors list
  const stats = {
    total:    vendors.length,
    approved: vendors.filter(v => v.isApproved && !v.isBanned).length,
    pending:  vendors.filter(v => !v.isApproved && !v.isBanned).length,
    banned:   vendors.filter(v => v.isBanned).length,
  }

  useEffect(() => {
    fetchVendors()
  }, [filter])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'approved') params.isApproved = true
      if (filter === 'pending')  params.isApproved = false
      if (search)                params.search = search

      const response = await adminService.getAllVendors(params)
      if (response.data.success) {
        let vendorList = response.data.vendors

        // Client-side filter for banned
        if (filter === 'banned') {
          vendorList = vendorList.filter(v => v.isBanned)
        }

        setVendors(vendorList)
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

  const filterTabs = [
    { id: 'all',      label: `All (${stats.total})`         },
    { id: 'pending',  label: `⏳ Pending (${stats.pending})`  },
    { id: 'approved', label: `✅ Approved (${stats.approved})` },
    { id: 'banned',   label: `🚫 Banned (${stats.banned})`    },
  ]

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Manage Vendors 🏪
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Approve, revoke, and manage mess vendors
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

      {/* ── STATS MINI CARDS ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-white',        bg: 'bg-slate-700/50'      },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-400',  bg: 'bg-emerald-500/10'    },
          { label: 'Pending',  value: stats.pending,  color: 'text-amber-400',    bg: 'bg-amber-500/10'      },
          { label: 'Banned',   value: stats.banned,   color: 'text-rose-400',     bg: 'bg-rose-500/10'       },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-slate-700/30
                         rounded-xl p-4 text-center`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── CASCADE INFO NOTE ────────────────── */}
      <AnimatePresence>
        <CascadeNote visible={showCascadeNote} />
      </AnimatePresence>

      {/* ── FILTER TABS ──────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setFilter(tab.id) }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium
                        whitespace-nowrap flex-shrink-0 border
                        transition-all
                        ${filter === tab.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SEARCH ───────────────────────────── */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <MdSearch className="absolute left-3.5 top-1/2
                             -translate-y-1/2 text-slate-400"
                  size={20} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors by name or email..."
          className="w-full bg-slate-800 border border-slate-700
                     rounded-xl pl-11 pr-4 py-3 text-white text-sm
                     placeholder-slate-500 focus:outline-none
                     focus:border-rose-500 transition-colors"
        />
      </form>

      {/* ── VENDORS GRID ─────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" text="Loading vendors..." />
        </div>
      ) : vendors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-slate-800/30 rounded-2xl
                     border border-dashed border-slate-700"
        >
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Vendors Found
          </h3>
          <p className="text-slate-400 text-sm">
            {filter === 'pending'
              ? 'No vendors waiting for approval'
              : filter === 'banned'
                ? 'No vendors are currently banned'
                : 'No vendors registered yet'
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                onAction={fetchVendors}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default ManageVendors