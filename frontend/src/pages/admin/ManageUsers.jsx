// =============================================
// pages/admin/ManageUsers.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MdSearch, MdRefresh, MdBlock, MdDelete,
  MdCheckCircle, MdPerson
} from 'react-icons/md'
import { adminService } from '../../services/adminService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('student')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionId, setActionId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { role: roleFilter, page, limit: 15 }
      if (search) params.search = search

      const response = await adminService.getAllUsers(params)
      if (response.data.success) {
        setUsers(response.data.users)
        setTotalPages(response.data.pages || 1)
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleBanToggle = async (userId, currentBanStatus, userName) => {
    if (!window.confirm(
      `${currentBanStatus ? 'Unban' : 'Ban'} ${userName}?`
    )) return

    setActionId(userId)
    try {
      await adminService.toggleUserBan(userId)
      toast.success(
        currentBanStatus
          ? `${userName} has been unbanned`
          : `${userName} has been banned`
      )
      fetchUsers()
    } catch (error) {
      toast.error('Action failed')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(
      `Permanently delete ${userName}? This cannot be undone!`
    )) return

    setActionId(userId)
    try {
      await adminService.deleteUser(userId)
      toast.success(`${userName} deleted`)
      fetchUsers()
    } catch (error) {
      toast.error('Delete failed')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Manage Students
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            View and manage registered students
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-3 bg-slate-800 border border-slate-700
                     rounded-xl text-slate-400 hover:text-white
                     transition-colors"
        >
          <MdRefresh size={20} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <MdSearch className="absolute left-3.5 top-1/2
                               -translate-y-1/2 text-slate-400"
                    size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-800 border border-slate-700
                       rounded-xl pl-11 pr-4 py-3 text-white text-sm
                       placeholder-slate-500 focus:outline-none
                       focus:border-rose-500 transition-colors"
          />
        </form>

        <div className="flex gap-2">
          {['student', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1) }}
              className={`px-4 py-3 rounded-xl text-sm font-medium
                          capitalize transition-all border
                          ${roleFilter === r
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-slate-700/50
                   rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-slate-400 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30 border-b border-slate-700/50">
                <tr>
                  {['User', 'Student ID', 'Department', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h}
                        className="text-left px-6 py-4 text-xs font-semibold
                                   text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-500/20 rounded-full
                                        flex items-center justify-center
                                        text-indigo-400 font-bold text-sm
                                        flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">
                        {user.studentId || '—'}
                      </p>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">
                        {user.department || '—'}
                      </p>
                    </td>

                    {/* Join date */}
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1
                                        rounded-full border
                                        ${user.isBanned
                                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                        }`}>
                        {user.isBanned ? '🚫 Banned' : '✅ Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Ban/Unban */}
                        <button
                          onClick={() => handleBanToggle(
                            user._id, user.isBanned, user.name
                          )}
                          disabled={actionId === user._id}
                          className={`p-2 rounded-lg transition-colors
                                      ${user.isBanned
                                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                        : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                                      }`}
                          title={user.isBanned ? 'Unban user' : 'Ban user'}
                        >
                          {actionId === user._id ? (
                            <Loader size="sm" text="" />
                          ) : user.isBanned ? (
                            <MdCheckCircle size={16} />
                          ) : (
                            <MdBlock size={16} />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={actionId === user._id}
                          className="p-2 rounded-lg text-rose-400
                                     bg-rose-500/10 hover:bg-rose-500/20
                                     transition-colors"
                          title="Delete user"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
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
              Page {page} of {totalPages}
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

export default ManageUsers