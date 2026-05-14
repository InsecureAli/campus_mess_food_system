// =============================================
// components/common/Loader.jsx
// =============================================

import React from 'react'
import { motion } from 'framer-motion'

const Loader = ({ size = 'md', text = 'Loading...' }) => {
  // Size variants
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinning ring animation */}
      <motion.div
        className={`${sizes[size]} border-4 border-slate-700
                   border-t-indigo-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Loading text */}
      {text && (
        <motion.p
          className="text-slate-400 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default Loader