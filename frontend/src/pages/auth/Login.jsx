// =============================================
// pages/auth/Login.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff,
         MdRestaurant } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../../components/common/Loader.jsx'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [role, setRole] = useState('student')  // 'student', 'vendor', 'admin'
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { login, isAuthenticated, isAdmin, isVendor } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Where to redirect after login
  const from = location.state?.from?.pathname || null

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin/dashboard', { replace: true })
      else if (isVendor) navigate('/vendor/dashboard', { replace: true })
      else navigate('/student/dashboard', { replace: true })
    }
  }, [isAuthenticated])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Form validation
  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const result = await login(formData.email, formData.password, role)
    setIsLoading(false)

    if (result.success) {
      const userRole = result.user?.role || (result.user?.vendorName ? 'vendor' : 'student')
      if (from) {
        navigate(from, { replace: true })
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard')
      } else if (userRole === 'vendor' || result.user?.vendorName) {
        navigate('/vendor/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    }
  }

  // Role button config
  const roles = [
    { id: 'student', label: 'Student',  emoji: '👨‍🎓', color: 'indigo' },
    { id: 'vendor',  label: 'Vendor',   emoji: '🏪',   color: 'amber'  },
    { id: 'admin',   label: 'Admin',    emoji: '🛡️',   color: 'rose'   },
  ]

  const roleColors = {
    student: { active: 'bg-indigo-500/20 border-indigo-500 text-indigo-400',
                btn:   'bg-indigo-500 hover:bg-indigo-600' },
    vendor:  { active: 'bg-amber-500/20 border-amber-500 text-amber-400',
                btn:   'bg-amber-500 hover:bg-amber-600' },
    admin:   { active: 'bg-rose-500/20 border-rose-500 text-rose-400',
                btn:   'bg-rose-500 hover:bg-rose-600' },
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center
                      px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">🍽️</span>
              <span className="text-xl font-bold text-white">
                Campus <span className="text-indigo-400">Mess</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-slate-400">Sign in to your account</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5
                          rounded-2xl border border-slate-700/50">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex-1 flex items-center justify-center gap-1.5
                            py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 border
                            ${role === r.id
                              ? roleColors[r.id].active
                              : 'border-transparent text-slate-400 hover:text-white'
                            }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className={`w-full bg-slate-800 border rounded-xl
                              pl-11 pr-4 py-3.5 text-white placeholder-slate-500
                              focus:outline-none focus:ring-2 transition-all
                              text-sm
                              ${errors.email
                                ? 'border-rose-500 focus:ring-rose-500/30'
                                : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                              }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-rose-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full bg-slate-800 border rounded-xl
                              pl-11 pr-12 py-3.5 text-white placeholder-slate-500
                              focus:outline-none focus:ring-2 transition-all
                              text-sm
                              ${errors.password
                                ? 'border-rose-500 focus:ring-rose-500/30'
                                : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                              }`}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword
                    ? <MdVisibilityOff size={20} />
                    : <MdVisibility size={20} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-rose-400 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full py-3.5 rounded-xl font-semibold text-white
                          transition-all duration-200 flex items-center
                          justify-center gap-2 mt-2 text-sm
                          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                          ${roleColors[role].btn}`}
            >
              {isLoading ? (
                <>
                  <Loader size="sm" text="" />
                  <span>Signing in...</span>
                </>
              ) : (
                `Sign in as ${roles.find(r => r.id === role)?.label}`
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300
                         font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl
                          border border-slate-700/50">
            <p className="text-slate-400 text-xs text-center mb-2 font-medium">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-slate-500 text-center">
              <p>Admin: admin@campus.edu / Admin@123</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center
                      bg-gradient-to-br from-indigo-900/50 to-slate-900
                      border-l border-slate-700/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64
                          bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48
                          bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-12">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-9xl mb-8"
          >
            🍽️
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Campus Mess Food System
          </h2>
          <p className="text-slate-400 text-lg max-w-xs mx-auto">
            Order delicious meals from your campus cafeteria, anytime anywhere.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              '✅ Pre-order your meals',
              '✅ Skip the long queues',
              '✅ Track orders live',
              '✅ Multiple vendors',
            ].map((item) => (
              <p key={item} className="text-slate-300 text-sm">{item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login