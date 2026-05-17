
// =============================================
// services/adminService.js - UPDATED
// =============================================

import api from './api.js'

export const adminService = {
  // Dashboard statistics
  getStats: () => api.get('/admin/stats'),

  // User management
  getAllUsers:    (params = {}) => api.get('/admin/users', { params }),
  toggleUserBan: (id)          => api.put(`/admin/users/${id}/ban`),
  deleteUser:    (id)          => api.delete(`/admin/users/${id}`),

  // Vendor management
  getAllVendors:  (params = {}) => api.get('/admin/vendors', { params }),
  approveVendor: (id, data)    => api.put(`/admin/vendors/${id}/approve`, data),
  toggleVendorBan: (id)        => api.put(`/admin/vendors/${id}/ban`),  // ✅ NEW

  // Order management
  getAllOrders:   (params = {}) => api.get('/admin/orders', { params }),
}