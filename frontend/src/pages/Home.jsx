// =============================================
// pages/Home.jsx - Landing Page
// =============================================

import React, { useLayoutEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdRestaurant, MdAccessTime, MdStar, MdArrowForward,
  MdCheckCircle, MdPeople, MdStorefront, MdPhone
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext.jsx'

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Features data
const features = [
  {
    icon: MdRestaurant,
    title: 'Browse Daily Menu',
    desc: 'View fresh menus added by vendors every day. Filter by category, time, and dietary preference.',
    color: 'indigo',
  },
  {
    icon: MdAccessTime,
    title: 'Pre-Order Meals',
    desc: 'Order your food in advance and pick it up at your preferred time. No more waiting in queues!',
    color: 'emerald',
  },
  {
    icon: MdStar,
    title: 'Track Orders Live',
    desc: 'Watch your order status update in real-time from pending to ready for pickup.',
    color: 'amber',
  },
  {
    icon: MdPeople,
    title: 'Multi-Role System',
    desc: 'Separate dashboards for students, vendors, and admins with role-based access control.',
    color: 'purple',
  },
]

// Statistics
const stats = [
  { value: '500+', label: 'Students Served' },
  { value: '15+',  label: 'Food Vendors' },
  { value: '50+',  label: 'Menu Items Daily' },
  { value: '98%',  label: 'Satisfaction Rate' },
]

const Home = () => {
  const { isAuthenticated, isStudent, isVendor, isAdmin } = useAuth()
  const navigate = useNavigate()

  const navRef = useRef(null)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const rolesRef = useRef(null)

  // #region agent log
  useLayoutEffect(() => {
    const nav = navRef.current
    const hero = heroRef.current
    const stats = statsRef.current
    const features = featuresRef.current
    const roles = rolesRef.current
    if (!hero) return

    const post = (hypothesisId, message, data) => {
      fetch('http://127.0.0.1:7695/ingest/6036efff-302b-4136-96a5-bdaf39a984dd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0f63bc' },
        body: JSON.stringify({
          sessionId: '0f63bc',
          hypothesisId,
          location: 'Home.jsx:useLayoutEffect',
          message,
          data,
          timestamp: Date.now(),
          runId: 'post-cascade-fix',
        }),
      }).catch(() => {})
    }

    const heroCs = getComputedStyle(hero)
    const navH = nav ? nav.getBoundingClientRect().height : null
    const sRect = stats?.getBoundingClientRect()
    const fRect = features?.getBoundingClientRect()
    const rRect = roles?.getBoundingClientRect()

    post('H1', 'tailwind section padding', {
      heroPaddingTop: heroCs.paddingTop,
      heroPaddingBottom: heroCs.paddingBottom,
      statsPaddingTop: stats ? getComputedStyle(stats).paddingTop : null,
      statsPaddingBottom: stats ? getComputedStyle(stats).paddingBottom : null,
      featuresPaddingTop: features ? getComputedStyle(features).paddingTop : null,
      rolesPaddingTop: roles ? getComputedStyle(roles).paddingTop : null,
    })
    post('H2', 'hero overflow', {
      overflow: heroCs.overflow,
      overflowX: heroCs.overflowX,
      overflowY: heroCs.overflowY,
    })
    post('H3', 'fixed nav vs hero top padding', {
      navHeight: navH,
      heroPaddingTopPx: parseFloat(heroCs.paddingTop) || 0,
    })
    post('H4', 'adjacent section bounds gap px', {
      statsBottomToFeaturesTop: sRect && fRect ? Math.round(fRect.top - sRect.bottom) : null,
      featuresBottomToRolesTop: fRect && rRect ? Math.round(rRect.top - fRect.bottom) : null,
    })
  }, [])
  // #endregion

  // If already logged in, redirect to dashboard
  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin/dashboard')
      else if (isVendor) navigate('/vendor/dashboard')
      else navigate('/student/dashboard')
    } else {
      navigate('/register')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ══════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════ */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50
                      bg-slate-900/80 backdrop-blur-md
                      border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-bold text-lg">
                NTU <span className="text-indigo-400">Mess Food System </span>
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleGetStarted}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white
                             px-5 py-2 rounded-xl text-sm font-medium
                             transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white px-4 py-2
                               text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white
                               px-5 py-2 rounded-xl text-sm font-medium
                               transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════ */}
      <section ref={heroRef} className="pt-36 sm:pt-40 pb-24 px-4 relative overflow-x-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96
                        bg-indigo-600/20 rounded-full blur-3xl
                        pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72
                        bg-purple-600/20 rounded-full blur-3xl
                        pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2
                             bg-indigo-500/10 border border-indigo-500/30
                             rounded-full text-indigo-400 text-sm font-medium
                             mb-6">
              🎓 University Food Management System
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold
                       leading-snug mb-8"
          >
            Your Campus{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400
                             bg-clip-text text-transparent">
              Food Experience
            </span>
            {' '}Reimagined
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl
                       mx-auto mb-10 leading-relaxed"
          >
            Pre-order meals, skip queues, track orders live.
            A modern food ordering system designed specifically
            for university students and campus vendors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center
                       justify-center gap-4"
          >
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 bg-indigo-500
                         hover:bg-indigo-600 text-white px-8 py-4
                         rounded-2xl font-semibold text-lg
                         transition-all duration-200 hover:scale-105
                         shadow-lg shadow-indigo-500/25"
            >
              Get Started Free
              <MdArrowForward size={22} />
            </button>

            <Link
              to="/login"
              className="flex items-center gap-2 bg-slate-800
                         hover:bg-slate-700 text-white px-8 py-4
                         rounded-2xl font-semibold text-lg
                         transition-all duration-200 border
                         border-slate-700 hover:border-slate-600"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS SECTION
          ══════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 pb-20 px-4 border-y border-slate-700/50
                          bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="text-center"
              >
                <p className="text-4xl font-extrabold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
          ══════════════════════════════════════════ */}
      <section ref={featuresRef} className="pt-28 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 mt-2"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete food ordering ecosystem for your campus
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon
              const colorMap = {
                indigo:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
                purple:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
              }

              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="bg-slate-800/50 border border-slate-700/50
                             rounded-2xl p-8 hover:bg-slate-800
                             transition-colors duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center
                                   justify-center mb-6 border
                                   ${colorMap[feature.color]}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ROLES SECTION
          ══════════════════════════════════════════ */}
      <section ref={rolesRef} className="pt-28 pb-24 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 mt-2"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Everyone
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10
                         border border-indigo-500/20 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">👨‍🎓</div>
              <h3 className="text-xl font-bold text-white mb-3">Students</h3>
              <ul className="space-y-2 text-slate-400 text-sm text-left">
                {['Browse daily menu','Pre-order meals','Track order status',
                  'Order history','Multiple vendors'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <MdCheckCircle className="text-indigo-400 flex-shrink-0" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-6 inline-block w-full bg-indigo-500
                           hover:bg-indigo-600 text-white py-3
                           rounded-xl font-medium text-sm
                           transition-colors duration-200"
              >
                Register as Student
              </Link>
            </motion.div>

            {/* Vendor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10
                         border border-amber-500/20 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-white mb-3">Vendors</h3>
              <ul className="space-y-2 text-slate-400 text-sm text-left">
                {['Add daily menu','Manage food items','Receive orders',
                  'Accept/reject orders','Sales analytics'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <MdCheckCircle className="text-amber-400 flex-shrink-0" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-6 inline-block w-full bg-amber-500
                           hover:bg-amber-600 text-white py-3
                           rounded-xl font-medium text-sm
                           transition-colors duration-200"
              >
                Register as Vendor
              </Link>
            </motion.div>

            {/* Admin */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-rose-500/10 to-pink-500/10
                         border border-rose-500/20 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Admin</h3>
              <ul className="space-y-2 text-slate-400 text-sm text-left">
                {['Manage all users','Approve vendors','Monitor orders',
                  'System analytics','Ban/unban users'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <MdCheckCircle className="text-rose-400 flex-shrink-0" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className="mt-6 inline-block w-full bg-rose-500
                           hover:bg-rose-600 text-white py-3
                           rounded-xl font-medium text-sm
                           transition-colors duration-200"
              >
                Admin Login
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
          ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20
                       border border-indigo-500/30 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join hundreds of students already using Campus Mess System
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-indigo-500 hover:bg-indigo-600 text-white
                         px-10 py-4 rounded-2xl font-semibold text-lg
                         transition-all duration-200 hover:scale-105
                         shadow-lg shadow-indigo-500/25 inline-flex
                         items-center gap-2"
            >
              Start Ordering Now
              <MdArrowForward size={22} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════ */}
      <footer className="border-t border-slate-700/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-bold text-white">Campus Mess</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 - National Textile University - Mess Food System. 
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home