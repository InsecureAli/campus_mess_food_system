// =============================================
// services/orderService.js
// =============================================

import api from './api.js'

export const orderService = {
  // Place a new order (student)
  createOrder: (orderData) => api.post('/orders', orderData),

  // Get student's own orders
  getMyOrders: (params = {}) => api.get('/orders/my-orders', { params }),

  // Get single order
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Get vendor's received orders
  getVendorOrders: (params = {}) => api.get('/orders/vendor-orders', { params }),

  // Update order status (vendor)
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),

  // Cancel order (student)
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
}