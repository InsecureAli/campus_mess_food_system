// =============================================
// components/common/StatCard.jsx
// =============================================
// Reusable statistics card for dashboards

import React from 'react'
import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color, subtitle, delay = 0 }) => {
  // Color variants
  const colorMap = {
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
    rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20' },
    purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  }

  const colors = colorMap[color] || colorMap.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6
                  border ${colors.border} cursor-default
                  hover:bg-slate-800 transition-colors duration-300`}
    >
      {/* Top row: icon + value */}
      <div className="flex items-start justify-between">
        {/* Value */}
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>

        {/* Icon */}
        <div className={`${colors.bg} ${colors.text} p-3 rounded-xl`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard