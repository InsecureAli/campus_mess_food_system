// =============================================
// context/AuthContext.jsx
// =============================================
// Context API = Global state management
// Think of it as a "global variable store"
// ANY component can read/update auth state
// without passing props through every level

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService.js'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// 1. CREATE THE CONTEXT
// ─────────────────────────────────────────────
// AuthContext is like a "container" for auth data
// We export it so components can access it
export const AuthContext = createContext(null)

// ─────────────────────────────────────────────
// 2. CREATE THE PROVIDER COMPONENT
// ─────────────────────────────────────────────
// AuthProvider wraps our app and provides auth state
// to ALL child components

export const AuthProvider = ({ children }) => {
  // ── STATE VARIABLES ───────────────────────────
  // user: stores logged-in user data (null if not logged in)
  const [user, setUser] = useState(null)

  // loading: true while checking if user is logged in
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────
  // CHECK IF USER IS ALREADY LOGGED IN
  // ─────────────────────────────────────────────
  // When app loads, check localStorage for saved user
  // This keeps user logged in after page refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage for saved user data
        const savedUser = localStorage.getItem('campusMessUser')
        const savedToken = localStorage.getItem('campusMessToken')

        if (savedUser && savedToken) {
          // Parse the saved JSON string back to object
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)

          // Optionally verify token is still valid with backend
          // This catches cases where token expired while user was away
          try {
            const response = await authService.getProfile()
            if (response.data.success) {
              // Update user with fresh data from server
              setUser(response.data.user || response.data.vendor)
            }
          } catch (error) {
            // Token expired or invalid → logout
            localStorage.removeItem('campusMessUser')
            localStorage.removeItem('campusMessToken')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        // Always set loading to false when done
        setLoading(false)
      }
    }

    initializeAuth()
  }, []) // Empty array = run only once when component mounts

  // ─────────────────────────────────────────────
  // AUTH FUNCTIONS
  // ─────────────────────────────────────────────

  // LOGIN FUNCTION
  const login = async (email, password, role = 'student') => {
    try {
      let response

      // Call different API based on role
      if (role === 'vendor') {
        response = await authService.loginVendor({ email, password })
      } else {
        response = await authService.loginUser({ email, password })
      }

      const { token, user: userData, vendor: vendorData } = response.data
      const loggedInUser = userData || vendorData

      // Save to state
      setUser(loggedInUser)

      // Save to localStorage for persistence across page refreshes
      localStorage.setItem('campusMessUser', JSON.stringify(loggedInUser))
      localStorage.setItem('campusMessToken', token)

      toast.success(response.data.message || 'Login successful! 👋')

      // Return user data so calling component knows what role to redirect to
      return { success: true, user: loggedInUser }

    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // REGISTER STUDENT FUNCTION
  const registerStudent = async (formData) => {
    try {
      const response = await authService.registerStudent(formData)
      const { token, user: userData } = response.data

      setUser(userData)
      localStorage.setItem('campusMessUser', JSON.stringify(userData))
      localStorage.setItem('campusMessToken', token)

      toast.success('Registration successful! Welcome! 🎉')
      return { success: true, user: userData }

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // REGISTER VENDOR FUNCTION
  const registerVendor = async (formData) => {
    try {
      const response = await authService.registerVendor(formData)
      const { token, vendor } = response.data

      setUser(vendor)
      localStorage.setItem('campusMessUser', JSON.stringify(vendor))
      localStorage.setItem('campusMessToken', token)

      toast.success('Vendor registration successful! Awaiting approval.')
      return { success: true, vendor }

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // LOGOUT FUNCTION
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Even if API call fails, clear local data
      console.error('Logout API error:', error)
    } finally {
      // Clear all stored data
      setUser(null)
      localStorage.removeItem('campusMessUser')
      localStorage.removeItem('campusMessToken')
      toast.success('Logged out successfully')
    }
  }

  // UPDATE USER IN STATE (after profile update)
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('campusMessUser', JSON.stringify(updatedUser))
  }

  // ─────────────────────────────────────────────
  // COMPUTED VALUES (derived from state)
  // ─────────────────────────────────────────────
  const isAuthenticated = !!user          // true if user exists
  const isStudent = user?.role === 'student'
  const isVendor = user?.role === 'vendor' || user?.vendorName !== undefined
  const isAdmin = user?.role === 'admin'

  // ─────────────────────────────────────────────
  // CONTEXT VALUE (what we share with all components)
  // ─────────────────────────────────────────────
  const contextValue = {
    user,           // Current user object
    loading,        // Is auth being checked?
    isAuthenticated,
    isStudent,
    isVendor,
    isAdmin,
    login,
    registerStudent,
    registerVendor,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Render children only after auth check is complete */}
      {/* This prevents flash of wrong content */}
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────
// 3. CREATE CUSTOM HOOK
// ─────────────────────────────────────────────
// Custom hook makes it easy to use context
// Instead of: const { user } = useContext(AuthContext)
// We use:     const { user } = useAuth()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}