import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center
                  justify-center text-center px-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      className="text-9xl mb-6"
    >
      🍽️
    </motion.div>
    <h1 className="text-6xl font-black text-white mb-4">404</h1>
    <p className="text-2xl font-bold text-white mb-2">Page Not Found</p>
    <p className="text-slate-400 mb-8">
      Looks like this page wandered off to get food!
    </p>
    <Link
      to="/"
      className="bg-indigo-500 hover:bg-indigo-600 text-white
                 px-8 py-3 rounded-xl font-semibold transition-colors"
    >
      Go Home
    </Link>
  </div>
)

export default NotFound
