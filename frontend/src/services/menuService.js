// =============================================
// services/menuService.js
// =============================================

import api from './api.js'

export const menuService = {
  // Get all menu items (with optional filters)
  // params = { category, date, search, isVeg, sortBy, page }
  getMenuItems: (params = {}) => api.get('/menu', { params }),

  // Get single menu item
  getMenuItemById: (id) => api.get(`/menu/${id}`),

  // Get vendor's own menu
  getVendorMenu: (params = {}) => api.get('/menu/vendor/my-menu', { params }),

  // Create new menu item (vendor only)
  // Uses FormData for image upload
  createMenuItem: (formData) =>
    api.post('/menu', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update menu item
  updateMenuItem: (id, formData) =>
    api.put(`/menu/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete menu item
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
}