// =============================================
// pages/student/Menu.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdSearch, MdFilterList, MdShoppingCart,
  MdStar, MdAccessTime, MdLocalFireDepartment,
  MdRefresh
} from 'react-icons/md'
import { menuService } from '../../services/menuService.js'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

// Food categories
const CATEGORIES = [
  { id: 'All',       emoji: '🍽️', label: 'All Items'  },
  { id: 'Breakfast', emoji: '🍳', label: 'Breakfast'  },
  { id: 'Lunch',     emoji: '🍛', label: 'Lunch'      },
  { id: 'Dinner',    emoji: '🍽️', label: 'Dinner'     },
  { id: 'Snacks',    emoji: '🍟', label: 'Snacks'     },
  { id: 'Beverages', emoji: '☕', label: 'Beverages'  },
  { id: 'Desserts',  emoji: '🍰', label: 'Desserts'   },
  { id: 'Special',   emoji: '⭐', label: 'Special'    },
]

// Individual Food Card Component
const FoodCard = ({ item, onAddToCart }) => {
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    onAddToCart(item)
    setTimeout(() => setAdding(false), 600)
  }

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 border border-slate-700/50 rounded-2xl
                 overflow-hidden hover:border-indigo-500/30
                 hover:bg-slate-800 transition-colors duration-300
                 flex flex-col"
    >
      {/* Food Image */}
      <div className="relative h-48 bg-slate-700 overflow-hidden flex-shrink-0">
        {item.image ? (
          <img
            src={`${backendUrl}${item.image}`}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-110
                       transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}

        {/* Fallback emoji */}
        <div
          className="absolute inset-0 flex items-center justify-center
                     text-6xl"
          style={{ display: item.image ? 'none' : 'flex' }}
        >
          {item.category === 'Breakfast' ? '🍳' :
           item.category === 'Lunch' ? '🍛' :
           item.category === 'Dinner' ? '🍽️' :
           item.category === 'Snacks' ? '🍟' :
           item.category === 'Beverages' ? '☕' :
           item.category === 'Desserts' ? '🍰' : '⭐'}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white
                           text-xs px-2.5 py-1 rounded-full font-medium">
            {item.category}
          </span>
        </div>

        {/* Veg/Non-veg badge */}
        <div className="absolute top-3 right-3">
          <div className={`w-6 h-6 rounded border-2 bg-slate-900/80
                           flex items-center justify-center
                           ${item.isVeg
                             ? 'border-emerald-500'
                             : 'border-rose-500'
                           }`}>
            <div className={`w-2.5 h-2.5 rounded-full
                             ${item.isVeg
                               ? 'bg-emerald-500'
                               : 'bg-rose-500'
                             }`} />
          </div>
        </div>

        {/* Availability overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/80 flex
                          items-center justify-center">
            <span className="text-rose-400 font-semibold text-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-base leading-tight">
            {item.title}
          </h3>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <MdStar className="text-amber-400" size={14} />
              <span className="text-amber-400 text-xs font-medium">
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Vendor name */}
        <p className="text-slate-500 text-xs mb-3">
          🏪 {item.vendor?.messName || 'Campus Mess'}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
          {item.preparationTime > 0 && (
            <div className="flex items-center gap-1">
              <MdAccessTime size={14} />
              <span>{item.preparationTime} min</span>
            </div>
          )}
          {item.calories > 0 && (
            <div className="flex items-center gap-1">
              <MdLocalFireDepartment size={14} className="text-orange-400" />
              <span>{item.calories} cal</span>
            </div>
          )}
          <span className="ml-auto text-emerald-400">
            {item.availableQuantity} left
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-bold text-white">
              ₹{item.price}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={!item.isAvailable || adding}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
                        text-sm font-semibold transition-all duration-200
                        ${!item.isAvailable
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : adding
                            ? 'bg-emerald-500 text-white'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
          >
            {adding ? (
              <>✓ Added</>
            ) : (
              <>
                <MdShoppingCart size={16} />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN MENU PAGE ─────────────────────────────
const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isVeg, setIsVeg] = useState(null) // null = all, true = veg, false = non-veg
  const [sortBy, setSortBy] = useState('createdAt')
  const { addToCart, cartVendor } = useCart()

  useEffect(() => {
    fetchMenu()
  }, [category, isVeg, sortBy])

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const params = { sortBy }
      if (category !== 'All') params.category = category
      if (isVeg !== null) params.isVeg = isVeg
      if (search) params.search = search

      const response = await menuService.getMenuItems(params)
      if (response.data.success) {
        setMenuItems(response.data.menuItems)
      }
    } catch (error) {
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchMenu()
  }

  const handleAddToCart = (item) => {
    if (!item.vendor) {
      toast.error('Vendor info missing')
      return
    }
    addToCart(item, item.vendor)
  }

  // Filter items by search locally
  const filteredItems = menuItems.filter((item) => {
    if (!search) return true
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ──────────────────────── */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Today's Menu 🍽️
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Fresh meals prepared daily by campus vendors
        </p>
      </div>

      {/* ── SEARCH & FILTERS ─────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2
                               text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="w-full bg-slate-800 border border-slate-700
                       rounded-xl pl-11 pr-4 py-3 text-white text-sm
                       placeholder-slate-500 focus:outline-none
                       focus:border-indigo-500 transition-colors"
          />
        </form>

        {/* Veg/Non-veg Filter */}
        <div className="flex gap-2">
          {[
            { val: null,  label: 'All',     active: isVeg === null  },
            { val: true,  label: '🟢 Veg',  active: isVeg === true  },
            { val: false, label: '🔴 Non-veg', active: isVeg === false },
          ].map((btn) => (
            <button
              key={String(btn.val)}
              onClick={() => setIsVeg(btn.val)}
              className={`px-4 py-3 rounded-xl text-sm font-medium
                          transition-all duration-200 whitespace-nowrap
                          ${btn.active
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl
                     px-4 py-3 text-white text-sm focus:outline-none
                     focus:border-indigo-500 cursor-pointer"
        >
          <option value="createdAt">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Top Rated</option>
        </select>

        {/* Refresh */}
        <button
          onClick={fetchMenu}
          className="p-3 bg-slate-800 border border-slate-700
                     rounded-xl text-slate-400 hover:text-white
                     hover:border-slate-600 transition-colors"
        >
          <MdRefresh size={20} />
        </button>
      </div>

      {/* ── CATEGORY PILLS ───────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
                        text-sm font-medium whitespace-nowrap flex-shrink-0
                        transition-all duration-200 border
                        ${category === cat.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
                        }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── RESULTS COUNT ────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {loading ? 'Loading...' : `${filteredItems.length} items found`}
        </p>
        {cartVendor && (
          <p className="text-amber-400 text-xs">
            🛒 Cart: {cartVendor.messName}
          </p>
        )}
      </div>

      {/* ── MENU GRID ────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading menu..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No items found
          </h3>
          <p className="text-slate-400 text-sm">
            Try a different category or search term
          </p>
          <button
            onClick={() => { setCategory('All'); setSearch(''); setIsVeg(null) }}
            className="mt-4 text-indigo-400 hover:text-indigo-300
                       text-sm font-medium"
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <FoodCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default Menu