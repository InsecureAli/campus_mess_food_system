// =============================================
// pages/student/Menu.jsx - COMPLETE FIXED VERSION
// =============================================
// FIXES APPLIED:
// ✅ Improved empty state messages (context-aware)
// ✅ fetchMenu properly structured (no duplicate function)
// ✅ Backend filters approved vendors automatically
// ✅ Clean code structure

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdSearch, MdShoppingCart, MdStar,
  MdAccessTime, MdLocalFireDepartment, MdRefresh,
  MdStorefront
} from 'react-icons/md'
import { menuService } from '../../services/menuService.js'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

// Food category list with emojis
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

// Category emoji helper
const getCategoryEmoji = (category) => {
  const map = {
    Breakfast: '🍳',
    Lunch:     '🍛',
    Dinner:    '🍽️',
    Snacks:    '🍟',
    Beverages: '☕',
    Desserts:  '🍰',
    Special:   '⭐',
  }
  return map[category] || '🍜'
}

// ─────────────────────────────────────────────
// FOOD CARD COMPONENT
// ─────────────────────────────────────────────
// Individual card shown in the menu grid
// Handles add-to-cart animation and sold out state

const FoodCard = ({ item, onAddToCart }) => {
  const [adding, setAdding] = useState(false)

  // Backend base URL for image paths
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    'http://localhost:5000'

  const handleAdd = () => {
    if (!item.isAvailable || adding) return
    setAdding(true)
    onAddToCart(item)
    // Reset button after short delay
    setTimeout(() => setAdding(false), 800)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1   }}
      exit={{    opacity: 0, scale: 0.92 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 border border-slate-700/50
                 rounded-2xl overflow-hidden
                 hover:border-indigo-500/30 hover:bg-slate-800
                 transition-colors duration-300 flex flex-col"
    >
      {/* ── FOOD IMAGE ───────────────────────── */}
      <div className="relative h-48 bg-slate-700
                      overflow-hidden flex-shrink-0">

        {/* Actual image (if available) */}
        {item.image ? (
          <img
            src={`${backendUrl}${item.image}`}
            alt={item.title}
            className="w-full h-full object-cover
                       hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Hide broken image, show emoji fallback
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}

        {/* Emoji fallback (shown when no image or image fails) */}
        <div
          className="absolute inset-0 flex items-center
                     justify-center text-6xl"
          style={{ display: item.image ? 'none' : 'flex' }}
        >
          {getCategoryEmoji(item.category)}
        </div>

        {/* Category badge (top left) */}
        <div className="absolute top-3 left-3">
          <span className="bg-slate-900/80 backdrop-blur-sm
                           text-white text-xs px-2.5 py-1
                           rounded-full font-medium">
            {item.category}
          </span>
        </div>

        {/* Veg / Non-veg indicator (top right) */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-6 h-6 rounded border-2 bg-slate-900/80
                        flex items-center justify-center
                        ${item.isVeg
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        }`}
            title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full
                          ${item.isVeg
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                          }`}
            />
          </div>
        </div>

        {/* Sold out overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/80
                          flex items-center justify-center">
            <span className="text-rose-400 font-bold text-sm
                             bg-slate-900/90 px-4 py-1.5 rounded-full
                             border border-rose-500/50">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* ── CARD BODY ────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title + Rating row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-base leading-tight">
            {item.title}
          </h3>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <MdStar className="text-amber-400" size={14} />
              <span className="text-amber-400 text-xs font-semibold">
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-slate-400 text-sm leading-relaxed
                        mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Vendor name */}
        <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
          <MdStorefront size={13} />
          {item.vendor?.messName || 'Campus Mess'}
        </p>

        {/* Meta row: prep time, calories, quantity */}
        <div className="flex items-center gap-3 text-xs
                        text-slate-400 mb-4">
          {item.preparationTime > 0 && (
            <div className="flex items-center gap-1">
              <MdAccessTime size={13} />
              <span>{item.preparationTime} min</span>
            </div>
          )}
          {item.calories > 0 && (
            <div className="flex items-center gap-1">
              <MdLocalFireDepartment
                size={13}
                className="text-orange-400"
              />
              <span>{item.calories} cal</span>
            </div>
          )}
          {/* Available quantity (right-aligned) */}
          <span
            className={`ml-auto font-medium
                        ${item.availableQuantity <= 5
                          ? 'text-amber-400'   // Low stock warning
                          : 'text-emerald-400' // Normal stock
                        }`}
          >
            {item.availableQuantity <= 5 && item.availableQuantity > 0
              ? `Only ${item.availableQuantity} left!`
              : `${item.availableQuantity} left`
            }
          </span>
        </div>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-white">
            ₹{item.price}
          </span>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAdd}
            disabled={!item.isAvailable || adding}
            className={`flex items-center gap-2 px-4 py-2.5
                        rounded-xl text-sm font-semibold
                        transition-all duration-200
                        ${!item.isAvailable
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : adding
                            ? 'bg-emerald-500 text-white scale-95'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
          >
            {adding ? (
              <>✓ Added!</>
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

// ─────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────
// Context-aware empty state message
// Shows different message based on WHY there are no items

const EmptyState = ({ hasFilters, onClearFilters }) => {
  // When filters are active → user searched for something
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        className="text-center py-20 col-span-full"
      >
        {/* Search/filter icon */}
        <div className="text-6xl mb-4">🔍</div>

        <h3 className="text-xl font-semibold text-white mb-2">
          No items match your search
        </h3>

        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
          We couldn't find any food items matching your current
          filters. Try adjusting your search, category, or
          dietary preference.
        </p>

        {/* Suggestions */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-slate-500 text-xs font-medium uppercase
                        tracking-wider">
            Try these instead:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['All Categories', 'Veg & Non-veg', 'Clear Search'].map(
              (suggestion) => (
                <span
                  key={suggestion}
                  className="text-xs bg-slate-700 text-slate-300
                             px-3 py-1.5 rounded-full"
                >
                  {suggestion}
                </span>
              )
            )}
          </div>
        </div>

        {/* Clear filters button */}
        <button
          onClick={onClearFilters}
          className="bg-indigo-500 hover:bg-indigo-600 text-white
                     px-6 py-2.5 rounded-xl text-sm font-semibold
                     transition-colors duration-200"
        >
          Clear All Filters
        </button>
      </motion.div>
    )
  }

  // When NO filters are active → no menu available at all
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      className="text-center py-20 col-span-full"
    >
      {/* Empty plate illustration */}
      <div className="relative inline-block mb-6">
        <div className="text-8xl">🍽️</div>
        {/* Small clock badge */}
        <div className="absolute -bottom-1 -right-1 bg-amber-500
                        rounded-full w-8 h-8 flex items-center
                        justify-center text-base">
          ⏰
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">
        No Menu Available Right Now
      </h3>

      <p className="text-slate-400 text-sm max-w-md mx-auto
                    leading-relaxed mb-6">
        Today's menu hasn't been added yet, or no vendors are
        currently active. This could mean:
      </p>

      {/* Reason list */}
      <div className="bg-slate-800/50 border border-slate-700/50
                      rounded-2xl p-5 max-w-sm mx-auto mb-6 text-left">
        <ul className="space-y-2.5">
          {[
            { icon: '⏳', text: 'Vendors are still preparing today\'s menu' },
            { icon: '🕐', text: 'Check back closer to meal times'           },
            { icon: '📅', text: 'Menu may not be available on weekends'     },
            { icon: '✅', text: 'All vendors may be pending admin approval' },
          ].map((item) => (
            <li key={item.text}
                className="flex items-start gap-3 text-sm">
              <span className="text-base flex-shrink-0 mt-0.5">
                {item.icon}
              </span>
              <span className="text-slate-300">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Meal time guide */}
      <div className="flex justify-center gap-3 flex-wrap mb-6">
        {[
          { time: '7–10 AM',   label: 'Breakfast', emoji: '🍳', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5'   },
          { time: '12–2 PM',   label: 'Lunch',     emoji: '🍛', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
          { time: '7–9 PM',    label: 'Dinner',    emoji: '🍽️', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5'  },
        ].map((meal) => (
          <div
            key={meal.label}
            className={`flex items-center gap-2 px-4 py-2.5
                        rounded-xl border text-xs font-medium
                        ${meal.color}`}
          >
            <span>{meal.emoji}</span>
            <div className="text-left">
              <p className="font-semibold">{meal.label}</p>
              <p className="opacity-70">{meal.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh prompt */}
      <p className="text-slate-500 text-xs">
        Menu updates automatically. Try refreshing in a few minutes.
      </p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN MENU PAGE COMPONENT
// ─────────────────────────────────────────────

const Menu = () => {
  // ── STATE ──────────────────────────────────
  const [menuItems, setMenuItems] = useState([])
  const [loading,   setLoading  ] = useState(true)
  const [category,  setCategory ] = useState('All')
  const [search,    setSearch   ] = useState('')
  const [isVeg,     setIsVeg    ] = useState(null)
  // null = all, true = veg only, false = non-veg only
  const [sortBy,    setSortBy   ] = useState('createdAt')

  const { addToCart, cartVendor } = useCart()

  // ── FETCH MENU (runs on filter change) ─────
  useEffect(() => {
    fetchMenu()
  }, [category, isVeg, sortBy])
  // Note: 'search' is NOT in dependencies
  // Search is applied client-side for instant filtering
  // Server fetch happens on form submit or filter change

  const fetchMenu = async () => {
    setLoading(true)
    try {
      // Build query params
      const params = { sortBy }

      if (category !== 'All') params.category = category
      if (isVeg !== null)     params.isVeg    = isVeg
      if (search.trim())      params.search   = search.trim()

      // Backend automatically filters by approved vendors
      // (getApprovedVendorIds is called inside getMenuItems)
      const response = await menuService.getMenuItems(params)

      if (response.data.success) {
        setMenuItems(response.data.menuItems)
      }
    } catch (error) {
      console.error('Menu fetch error:', error)
      toast.error('Failed to load menu. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── SEARCH: submit handler (triggers server fetch) ──
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchMenu()
  }

  // ── ADD TO CART ─────────────────────────────
  const handleAddToCart = (item) => {
    if (!item.vendor) {
      toast.error('Vendor info missing for this item')
      return
    }
    addToCart(item, item.vendor)
  }

  // ── CLEAR ALL FILTERS ───────────────────────
  const clearAllFilters = () => {
    setCategory('All')
    setSearch('')
    setIsVeg(null)
    setSortBy('createdAt')
    // fetchMenu will run via useEffect when category changes
  }

  // ── CLIENT-SIDE SEARCH FILTER ───────────────
  // Apply search filter locally for instant results
  const filteredItems = menuItems.filter((item) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.vendor?.messName?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  })

  // Are any filters currently active?
  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All'   ||
    isVeg !== null

  // ── RENDER ──────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Today's Menu 🍽️
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Fresh meals from approved campus vendors
        </p>
      </div>

      {/* ════════════════════════════════════════
          SEARCH + FILTER BAR
          ════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search input */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 relative"
        >
          <MdSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2
                       text-slate-400 pointer-events-none"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food, vendor, category..."
            className="w-full bg-slate-800 border border-slate-700
                       rounded-xl pl-11 pr-4 py-3 text-white text-sm
                       placeholder-slate-500 focus:outline-none
                       focus:border-indigo-500 transition-colors"
          />
        </form>

        {/* Veg / Non-veg / All filter */}
        <div className="flex gap-2">
          {[
            { val: null,  label: 'All'        },
            { val: true,  label: '🟢 Veg'     },
            { val: false, label: '🔴 Non-veg' },
          ].map((btn) => (
            <button
              key={String(btn.val)}
              onClick={() => setIsVeg(btn.val)}
              className={`px-4 py-3 rounded-xl text-sm font-medium
                          whitespace-nowrap transition-all duration-200
                          ${isVeg === btn.val
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                          }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700
                     rounded-xl px-4 py-3 text-white text-sm
                     focus:outline-none focus:border-indigo-500
                     cursor-pointer transition-colors"
        >
          <option value="createdAt">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>

        {/* Refresh button */}
        <button
          onClick={fetchMenu}
          title="Refresh menu"
          className="p-3 bg-slate-800 border border-slate-700
                     rounded-xl text-slate-400 hover:text-white
                     hover:border-slate-600 transition-colors"
        >
          <MdRefresh size={20} />
        </button>
      </div>

      {/* ════════════════════════════════════════
          CATEGORY PILLS
          ════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5
                        rounded-xl text-sm font-medium
                        whitespace-nowrap flex-shrink-0
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

      {/* ════════════════════════════════════════
          STATUS BAR (results count + cart info)
          ════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Results count */}
          <p className="text-slate-400 text-sm">
            {loading
              ? 'Loading menu...'
              : filteredItems.length === 0
                ? 'No items found'
                : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} available`
            }
          </p>

          {/* Active filter indicators */}
          {!loading && hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-indigo-400 hover:text-indigo-300
                         text-xs font-medium transition-colors
                         flex items-center gap-1"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Cart vendor indicator */}
        {cartVendor && (
          <div className="flex items-center gap-2 bg-amber-500/10
                          border border-amber-500/30 rounded-xl
                          px-3 py-1.5">
            <span className="text-amber-400 text-xs font-medium">
              🛒 {cartVendor.messName}
            </span>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════════════ */}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader size="lg" text="Loading today's menu..." />
        </div>
      )}

      {/* Empty state (no results) */}
      {!loading && filteredItems.length === 0 && (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      )}

      {/* Menu grid */}
      {!loading && filteredItems.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
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

      {/* ════════════════════════════════════════
          BOTTOM REFRESH HINT
          (shown only when items are visible)
          ════════════════════════════════════════ */}
      {!loading && filteredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-slate-600 text-xs">
            Menu is updated daily by vendors •{' '}
            <button
              onClick={fetchMenu}
              className="text-indigo-500 hover:text-indigo-400
                         transition-colors"
            >
              Refresh
            </button>{' '}
            to see latest items
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default Menu