// =============================================
// pages/vendor/VendorProfile.jsx
// =============================================

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MdStore, MdEmail, MdPhone, MdLocationOn,
  MdAccessTime, MdSave, MdEdit
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/authService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const VendorProfile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    vendorName:      user?.vendorName || '',
    messName:        user?.messName || '',
    messDescription: user?.messDescription || '',
    phone:           user?.phone || '',
    address:         user?.address || '',
    openingTime:     user?.openingTime || '08:00',
    closingTime:     user?.closingTime || '22:00',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await authService.updateProfile(formData)
      if (response.data.success) {
        updateUser(response.data.vendor || formData)
        toast.success('Profile updated successfully!')
        setEditing(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  // Input styling helper
  const inputCls = (disabled) =>
    `w-full bg-slate-700 border border-slate-600 rounded-xl
     px-4 py-3 text-sm transition-colors
     ${disabled
       ? 'text-slate-400 cursor-not-allowed'
       : 'text-white focus:outline-none focus:border-amber-500'
     }`

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Vendor Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your mess information
          </p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                      text-sm font-semibold transition-colors
                      ${editing
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
        >
          {loading ? (
            <Loader size="sm" text="" />
          ) : editing ? (
            <><MdSave size={18} /> Save Changes</>
          ) : (
            <><MdEdit size={18} /> Edit Profile</>
          )}
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-700/50
                   rounded-2xl p-8"
      >
        {/* Vendor Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8
                        border-b border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500
                          to-orange-600 rounded-2xl flex items-center
                          justify-center text-4xl">
            🏪
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user?.vendorName}
            </h2>
            <p className="text-amber-400 font-medium">{user?.messName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2.5 py-1 rounded-full border
                                ${user?.isApproved
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                }`}>
                {user?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vendor Name */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdStore size={16} className="text-amber-400" />
                Vendor Name
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                disabled={!editing}
                className={inputCls(!editing)}
              />
            </div>

            {/* Mess Name */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdStore size={16} className="text-amber-400" />
                Mess / Canteen Name
              </label>
              <input
                type="text"
                name="messName"
                value={formData.messName}
                onChange={handleChange}
                disabled={!editing}
                className={inputCls(!editing)}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdEmail size={16} className="text-amber-400" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={inputCls(true)}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdPhone size={16} className="text-amber-400" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                className={inputCls(!editing)}
              />
            </div>

            {/* Opening Time */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdAccessTime size={16} className="text-amber-400" />
                Opening Time
              </label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                disabled={!editing}
                className={inputCls(!editing)}
              />
            </div>

            {/* Closing Time */}
            <div>
              <label className="flex items-center gap-2 text-sm
                                font-medium text-slate-300 mb-2">
                <MdAccessTime size={16} className="text-amber-400" />
                Closing Time
              </label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                disabled={!editing}
                className={inputCls(!editing)}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdLocationOn size={16} className="text-amber-400" />
              Address / Location
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Campus location..."
              className={inputCls(!editing)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium
                              text-slate-300 mb-2">
              About Your Mess
            </label>
            <textarea
              name="messDescription"
              value={formData.messDescription}
              onChange={handleChange}
              disabled={!editing}
              rows={4}
              placeholder="Describe your mess/canteen..."
              className={`${inputCls(!editing)} resize-none`}
            />
          </div>

          {/* Cancel button when editing */}
          {editing && (
            <button
              onClick={() => {
                setEditing(false)
                setFormData({
                  vendorName:      user?.vendorName || '',
                  messName:        user?.messName || '',
                  messDescription: user?.messDescription || '',
                  phone:           user?.phone || '',
                  address:         user?.address || '',
                  openingTime:     user?.openingTime || '08:00',
                  closingTime:     user?.closingTime || '22:00',
                })
              }}
              className="text-slate-400 hover:text-white text-sm
                         font-medium transition-colors"
            >
              Cancel changes
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Orders',   value: user?.totalOrders || 0,            color: 'text-amber-400' },
          { label: 'Total Earnings', value: `₹${user?.totalEarnings || 0}`,    color: 'text-emerald-400' },
          { label: 'Rating',         value: `${user?.rating || 0}/5 ⭐`,        color: 'text-indigo-400' },
        ].map((stat) => (
          <div key={stat.label}
               className="bg-slate-800/50 border border-slate-700/50
                          rounded-2xl p-5 text-center">
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </p>
            <p className="text-slate-400 text-xs">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default VendorProfile