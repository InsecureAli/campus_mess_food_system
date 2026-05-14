// =============================================
// services/authService.js
// =============================================
// All authentication-related API calls
// Components call these functions instead of
// writing axios calls directly

import api from './api.js'

export const authService = {
  // Register new student
  registerStudent: (data) => api.post('/auth/register', data),

  // Register new vendor
  registerVendor: (data) => api.post('/auth/register/vendor', data),

  // Login student or admin
  loginUser: (data) => api.post('/auth/login', data),

  // Login vendor
  loginVendor: (data) => api.post('/auth/login/vendor', data),

  // Get current user profile
  getProfile: () => api.get('/auth/profile'),

  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),

  // Logout
  logout: () => api.post('/auth/logout'),
}