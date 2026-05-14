// =============================================
// pages/auth/Register.jsx
// =============================================

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPerson, MdEmail, MdLock, MdPhone, MdStore,
  MdVisibility, MdVisibilityOff, MdArrowBack, MdArrowForward
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext.jsx'
import Loader from '../../components/common/Loader.jsx'

const Register = () => {
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(1)  // Multi-step form
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Student form data
  const [studentData, setStudentData] = useState({
    name: '', email: '', password: '', phone: '',
    studentId: '', department: '', semester: '',
  })

  // Vendor form data
  const [vendorData, setVendorData] = useState({
    vendorName: '', email: '', password: '', phone: '',
    messName: '', messDescription: '', address: '',
  })

  const { registerStudent, registerVendor } = useAuth()
  const navigate = useNavigate()

  const handleStudentChange = (e) => {
    const { name, value } = e.target
    setStudentData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleVendorChange = (e) => {
    const { name, value } = e.target
    setVendorData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Validate step 1 (common fields)
  const validateStep1 = () => {
    const newErrors = {}
    const data = role === 'student' ? studentData : vendorData
    const nameField = role === 'student' ? 'name' : 'vendorName'

    if (!data[nameField]) newErrors[nameField] = 'Name is required'
    if (!data.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(data.email))
      newErrors.email = 'Enter a valid email'
    if (!data.password) newErrors.password = 'Password is required'
    else if (data.password.length < 6)
      newErrors.password = 'At least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    let result
    if (role === 'student') {
      result = await registerStudent({
        ...studentData,
        semester: studentData.semester ? parseInt(studentData.semester) : null,
      })
    } else {
      result = await registerVendor(vendorData)
    }

    setIsLoading(false)

    if (result.success) {
      if (role === 'vendor') {
        navigate('/vendor/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    }
  }

  const inputClass = (field) =>
    `w-full bg-slate-800 border rounded-xl pl-11 pr-4 py-3.5
     text-white placeholder-slate-500 focus:outline-none focus:ring-2
     transition-all text-sm
     ${errors[field]
       ? 'border-rose-500 focus:ring-rose-500/30'
       : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
     }`

  return (
    <div className="min-h-screen bg-slate-900 flex items-center
                    justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl">🍽️</span>
            <span className="text-lg font-bold text-white">
              Campus <span className="text-indigo-400">Mess</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">
            Join the campus food revolution
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5
                        rounded-2xl border border-slate-700/50">
          {[
            { id: 'student', label: 'Student', emoji: '👨‍🎓' },
            { id: 'vendor',  label: 'Vendor',  emoji: '🏪'   },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setStep(1); setErrors({}) }}
              className={`flex-1 flex items-center justify-center gap-2
                          py-3 rounded-xl text-sm font-medium
                          transition-all duration-200 border
                          ${role === r.id
                            ? r.id === 'student'
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                              : 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                          }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center
                              justify-center text-sm font-bold transition-all
                              ${step >= s
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                              }`}>
                {s}
              </div>
              {s < 2 && (
                <div className={`w-16 h-0.5 transition-all
                                ${step > s ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  {role === 'student' ? 'Personal Information' : 'Vendor Information'}
                </h2>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {role === 'student' ? 'Full Name' : 'Your Name'}
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3.5 top-1/2
                                         -translate-y-1/2 text-slate-400"
                              size={20} />
                    <input
                      type="text"
                      name={role === 'student' ? 'name' : 'vendorName'}
                      value={role === 'student' ? studentData.name : vendorData.vendorName}
                      onChange={role === 'student' ? handleStudentChange : handleVendorChange}
                      placeholder="Enter your full name"
                      className={inputClass(role === 'student' ? 'name' : 'vendorName')}
                    />
                  </div>
                  {errors[role === 'student' ? 'name' : 'vendorName'] && (
                    <p className="mt-1.5 text-rose-400 text-xs">
                      {errors[role === 'student' ? 'name' : 'vendorName']}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-3.5 top-1/2
                                        -translate-y-1/2 text-slate-400"
                             size={20} />
                    <input
                      type="email"
                      name="email"
                      value={role === 'student' ? studentData.email : vendorData.email}
                      onChange={role === 'student' ? handleStudentChange : handleVendorChange}
                      placeholder="you@university.edu"
                      className={inputClass('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-rose-400 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <MdLock className="absolute left-3.5 top-1/2
                                       -translate-y-1/2 text-slate-400"
                            size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={role === 'student' ? studentData.password : vendorData.password}
                      onChange={role === 'student' ? handleStudentChange : handleVendorChange}
                      placeholder="Min. 6 characters"
                      className={`${inputClass('password')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2
                                 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-rose-400 text-xs">{errors.password}</p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white
                             py-3.5 rounded-xl font-semibold text-sm
                             transition-all duration-200 flex items-center
                             justify-center gap-2 mt-2"
                >
                  Next Step
                  <MdArrowForward size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Additional Info */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  {role === 'student' ? 'Student Details' : 'Mess Details'}
                </h2>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <MdPhone className="absolute left-3.5 top-1/2
                                        -translate-y-1/2 text-slate-400"
                             size={20} />
                    <input
                      type="tel"
                      name="phone"
                      value={role === 'student' ? studentData.phone : vendorData.phone}
                      onChange={role === 'student' ? handleStudentChange : handleVendorChange}
                      placeholder="10-digit mobile number"
                      className={inputClass('phone')}
                    />
                  </div>
                </div>

                {/* Student-specific fields */}
                {role === 'student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Student ID
                      </label>
                      <div className="relative">
                        <MdPerson className="absolute left-3.5 top-1/2
                                             -translate-y-1/2 text-slate-400"
                                  size={20} />
                        <input
                          type="text"
                          name="studentId"
                          value={studentData.studentId}
                          onChange={handleStudentChange}
                          placeholder="e.g. CS-2021-001"
                          className={inputClass('studentId')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium
                                          text-slate-300 mb-2">
                          Department
                        </label>
                        <select
                          name="department"
                          value={studentData.department}
                          onChange={handleStudentChange}
                          className="w-full bg-slate-800 border border-slate-700
                                     rounded-xl px-4 py-3.5 text-white text-sm
                                     focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select Dept.</option>
                          {['Computer Science', 'Electrical', 'Mechanical',
                            'Civil', 'Electronics', 'IT', 'MBA', 'Other'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium
                                          text-slate-300 mb-2">
                          Semester
                        </label>
                        <select
                          name="semester"
                          value={studentData.semester}
                          onChange={handleStudentChange}
                          className="w-full bg-slate-800 border border-slate-700
                                     rounded-xl px-4 py-3.5 text-white text-sm
                                     focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semester</option>
                          {[1,2,3,4,5,6,7,8].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Vendor-specific fields */}
                {role === 'vendor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mess / Canteen Name
                      </label>
                      <div className="relative">
                        <MdStore className="absolute left-3.5 top-1/2
                                            -translate-y-1/2 text-slate-400"
                                 size={20} />
                        <input
                          type="text"
                          name="messName"
                          value={vendorData.messName}
                          onChange={handleVendorChange}
                          placeholder="e.g. Main Campus Cafeteria"
                          className={inputClass('messName')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={vendorData.address}
                        onChange={handleVendorChange}
                        placeholder="Location in campus"
                        className="w-full bg-slate-800 border border-slate-700
                                   rounded-xl px-4 py-3.5 text-white text-sm
                                   placeholder-slate-500 focus:outline-none
                                   focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-5 py-3.5
                               bg-slate-700 hover:bg-slate-600 text-white
                               rounded-xl text-sm font-medium transition-colors"
                  >
                    <MdArrowBack size={18} />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-white
                                text-sm transition-all duration-200 flex items-center
                                justify-center gap-2
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                                ${role === 'student'
                                  ? 'bg-indigo-500 hover:bg-indigo-600'
                                  : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader size="sm" text="" />
                        Creating Account...
                      </>
                    ) : (
                      role === 'student'
                        ? 'Create Student Account'
                        : 'Register as Vendor'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Login Link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login"
                className="text-indigo-400 hover:text-indigo-300
                           font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register