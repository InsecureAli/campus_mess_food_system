// =============================================
// services/api.js - Axios Configuration
// =============================================
// Axios = HTTP client for making API requests
// We create one configured instance and use it everywhere
// This ensures all requests have correct base URL and headers

import axios from 'axios'

// ─────────────────────────────────────────────
// CREATE AXIOS INSTANCE
// ─────────────────────────────────────────────
// Instead of using axios directly, we create an instance
// with default configuration applied to ALL requests

const api = axios.create({
  // baseURL: All requests will be prefixed with this
  // So instead of: axios.get('http://localhost:5000/api/menu')
  // We write:      api.get('/menu')
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  // withCredentials: true sends cookies with every request
  // Our JWT is stored in httpOnly cookie, so this is needed
  withCredentials: true,

  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
  },

  // Timeout: Cancel request if it takes more than 15 seconds
  timeout: 15000,
})

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────
// Interceptors run BEFORE every request is sent
// We use this to automatically add JWT token to headers

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('campusMessToken')

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config // Continue with the modified config
  },
  (error) => {
    // If request setup fails, reject with error
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────
// Interceptors run AFTER every response is received
// We use this to handle global errors (like token expiry)

api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response
  },
  (error) => {
    // Handle specific error cases

    // 401 = Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('campusMessUser')
      localStorage.removeItem('campusMessToken')

      // Redirect to login page
      // Only redirect if not already on login/register page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login'
      }
    }

    // 403 = Forbidden (wrong role)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data?.message)
    }

    // Always reject so component catch blocks work
    return Promise.reject(error)
  }
)

export default api