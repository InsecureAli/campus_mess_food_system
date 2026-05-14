// =============================================
// pages/student/Profile.jsx
// =============================================

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MdPerson, MdEmail, MdPhone, MdSchool,
  MdEdit, MdSave, MdBadge
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/authService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name:       user?.name || '',
    phone:      user?.phone || '',
    studentId:  user?.studentId || '',
    department: user?.department || '',
    semester:   user?.semester || '',
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
        updateUser(response.data.user || formData)
        toast.success('Profile updated! ✅')
        setEditing(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (disabled) =>
    `w-full bg-slate-700 border border-slate-600 rounded-xl
     px-4 py-3 text-sm transition-colors
     ${disabled
       ? 'text-slate-400 cursor-not-allowed'
       : 'text-white focus:outline-none focus:border-indigo-500'
     }`

  const departments = [
    'Computer Science', 'Electrical', 'Mechanical',
    'Civil', 'Electronics', 'IT', 'MBA', 'Other',
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            My Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal information
          </p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                      text-sm font-semibold transition-colors
                      ${editing
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
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
        {/* Avatar section */}
        <div className="flex items-center gap-5 mb-8 pb-8
                        border-b border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500
                          to-purple-600 rounded-2xl flex items-center
                          justify-center text-3xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-indigo-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2.5 py-1 rounded-full
                               text-indigo-400 bg-indigo-500/10
                               border border-indigo-500/30">
                👨‍🎓 Student
              </span>
              {user?.semester && (
                <span className="text-xs px-2.5 py-1 rounded-full
                                 text-slate-400 bg-slate-700/50
                                 border border-slate-600">
                  Semester {user.semester}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdPerson size={16} className="text-indigo-400" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing}
              className={inputCls(!editing)}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdEmail size={16} className="text-indigo-400" />
              Email
            </label>
            <input
              type="email"
              value={user?.email}
              disabled
              className={inputCls(true)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdPhone size={16} className="text-indigo-400" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Enter phone number"
              className={inputCls(!editing)}
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdBadge size={16} className="text-indigo-400" />
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled={!editing}
              placeholder="e.g. CS-2021-001"
              className={inputCls(!editing)}
            />
          </div>

          {/* Department */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdSchool size={16} className="text-indigo-400" />
              Department
            </label>
            {editing ? (
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-3 text-white text-sm
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <input
                value={formData.department || ''}
                disabled
                className={inputCls(true)}
              />
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="flex items-center gap-2 text-sm
                              font-medium text-slate-300 mb-2">
              <MdSchool size={16} className="text-indigo-400" />
              Semester
            </label>
            {editing ? (
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-3 text-white text-sm
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            ) : (
              <input
                value={formData.semester ? `Semester ${formData.semester}` : ''}
                disabled
                className={inputCls(true)}
              />
            )}
          </div>
        </div>

        {/* Cancel when editing */}
        {editing && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => {
                setEditing(false)
                setFormData({
                  name:       user?.name || '',
                  phone:      user?.phone || '',
                  studentId:  user?.studentId || '',
                  department: user?.department || '',
                  semester:   user?.semester || '',
                })
              }}
              className="text-slate-400 hover:text-white text-sm
                         font-medium transition-colors"
            >
              Cancel changes
            </button>
          </div>
        )}
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 border border-slate-700/50
                   rounded-2xl p-6"
      >
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Account Information
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Member since</span>
            <span className="text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                : '—'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Account status</span>
            <span className="text-emerald-400 font-medium">Active ✅</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Role</span>
            <span className="text-indigo-400 capitalize">{user?.role}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile