import React from 'react'
import { motion } from 'framer-motion'

const Profile = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Profile
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Add and manage your daily menu items
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border
                      border-slate-700/50 p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Coming in Next Phase
        </h3>
        <p className="text-slate-400 text-sm">
          This page will be built in Phase 5
        </p>
      </div>
    </motion.div>
  )
}

export default Profile