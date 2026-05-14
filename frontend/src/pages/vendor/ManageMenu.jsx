// =============================================
// pages/vendor/ManageMenu.jsx
// =============================================

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdRestaurantMenu,
  MdImage, MdCheckCircle, MdCancel, MdSave,
  MdVisibility, MdVisibilityOff, MdRefresh
} from 'react-icons/md'
import { menuService } from '../../services/menuService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

// Food categories list
const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner',
  'Snacks', 'Beverages', 'Desserts', 'Special',
]

// Default empty form state
const DEFAULT_FORM = {
  title: '',
  description: '',
  category: 'Lunch',
  price: '',
  availableQuantity: '',
  isVeg: true,
  calories: '',
  preparationTime: '15',
  tags: '',
  date: new Date().toISOString().split('T')[0],
}

// ─────────────────────────────────────────────
// MENU ITEM FORM MODAL COMPONENT
// ─────────────────────────────────────────────
const MenuItemModal = ({ isOpen, onClose, onSave, editItem }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  // Fill form when editing an existing item
  useEffect(() => {
    if (editItem) {
      setFormData({
        title:             editItem.title || '',
        description:       editItem.description || '',
        category:          editItem.category || 'Lunch',
        price:             editItem.price?.toString() || '',
        availableQuantity: editItem.availableQuantity?.toString() || '',
        isVeg:             editItem.isVeg !== undefined ? editItem.isVeg : true,
        calories:          editItem.calories?.toString() || '',
        preparationTime:   editItem.preparationTime?.toString() || '15',
        tags:              editItem.tags?.join(', ') || '',
        date:              editItem.date
          ? new Date(editItem.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      })
      // Show existing image
      if (editItem.image) {
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') ||
                           'http://localhost:5000'
        setImagePreview(`${backendUrl}${editItem.image}`)
      }
    } else {
      // Reset form for new item
      setFormData(DEFAULT_FORM)
      setImageFile(null)
      setImagePreview('')
    }
    setErrors({})
  }, [editItem, isOpen])

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setImageFile(file)

    // Create preview URL for display
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // Remove selected image
  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Validate form
  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim())
      newErrors.title = 'Title is required'
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0)
      newErrors.price = 'Valid price is required'
    if (!formData.availableQuantity || isNaN(formData.availableQuantity))
      newErrors.availableQuantity = 'Valid quantity is required'
    if (!formData.category)
      newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      // Build FormData for multipart upload (image + JSON)
      const data = new FormData()

      // Append all text fields
      data.append('title',             formData.title.trim())
      data.append('description',       formData.description.trim())
      data.append('category',          formData.category)
      data.append('price',             formData.price)
      data.append('availableQuantity', formData.availableQuantity)
      data.append('isVeg',             formData.isVeg)
      data.append('calories',          formData.calories || 0)
      data.append('preparationTime',   formData.preparationTime || 15)
      data.append('date',              formData.date)

      // Convert comma-separated tags to array
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        tagsArray.forEach((tag) => data.append('tags[]', tag))
      }

      // Append image file if selected
      if (imageFile) {
        data.append('image', imageFile)
      }

      let response
      if (editItem) {
        // Update existing item
        response = await menuService.updateMenuItem(editItem._id, data)
      } else {
        // Create new item
        response = await menuService.createMenuItem(data)
      }

      if (response.data.success) {
        toast.success(
          editItem
            ? 'Menu item updated! ✅'
            : 'Menu item added! 🍽️'
        )
        onSave()  // Refresh parent list
        onClose() // Close modal
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save menu item'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    // Modal overlay
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                   flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1,   opacity: 1, y: 0  }}
          exit={{ scale: 0.9,    opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-slate-800 border border-slate-700/50
                     rounded-3xl w-full max-w-2xl max-h-[90vh]
                     overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6
                          border-b border-slate-700/50 sticky top-0
                          bg-slate-800 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl
                              flex items-center justify-center">
                <MdRestaurantMenu className="text-amber-400" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <p className="text-slate-400 text-xs">
                  {editItem ? 'Update food item details' : 'Add to today\'s menu'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white
                         hover:bg-slate-700 rounded-xl transition-colors"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── IMAGE UPLOAD ─────────────────── */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Food Image
              </label>

              {imagePreview ? (
                // Show image preview
                <div className="relative rounded-2xl overflow-hidden
                                h-48 bg-slate-700">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-rose-500
                               text-white p-1.5 rounded-lg
                               hover:bg-rose-600 transition-colors"
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              ) : (
                // Upload area
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600
                             rounded-2xl h-40 flex flex-col items-center
                             justify-center cursor-pointer
                             hover:border-amber-500/50 hover:bg-amber-500/5
                             transition-all duration-200"
                >
                  <MdImage className="text-slate-500 mb-2" size={36} />
                  <p className="text-slate-400 text-sm">
                    Click to upload food image
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* ── TITLE ────────────────────────── */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Food Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Paneer Butter Masala"
                className={`w-full bg-slate-700 border rounded-xl
                            px-4 py-3 text-white placeholder-slate-500
                            focus:outline-none focus:ring-2 text-sm
                            transition-all
                            ${errors.title
                              ? 'border-rose-500 focus:ring-rose-500/20'
                              : 'border-slate-600 focus:border-amber-500 focus:ring-amber-500/20'
                            }`}
              />
              {errors.title && (
                <p className="mt-1 text-rose-400 text-xs">{errors.title}</p>
              )}
            </div>

            {/* ── DESCRIPTION ──────────────────── */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the food item..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-3 text-white
                           placeholder-slate-500 focus:outline-none
                           focus:border-amber-500 text-sm resize-none
                           transition-colors"
              />
            </div>

            {/* ── CATEGORY + VEG/NON-VEG ──────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border rounded-xl
                              px-4 py-3 text-white text-sm
                              focus:outline-none focus:border-amber-500
                              transition-colors cursor-pointer
                              ${errors.category
                                ? 'border-rose-500'
                                : 'border-slate-600'
                              }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Veg/Non-veg Toggle */}
              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Type
                </label>
                <div className="flex gap-2 h-[46px]">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, isVeg: true }))}
                    className={`flex-1 flex items-center justify-center
                                gap-1.5 rounded-xl text-sm font-medium
                                border transition-all
                                ${formData.isVeg
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                  : 'bg-slate-700 border-slate-600 text-slate-400'
                                }`}
                  >
                    🟢 Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, isVeg: false }))}
                    className={`flex-1 flex items-center justify-center
                                gap-1.5 rounded-xl text-sm font-medium
                                border transition-all
                                ${!formData.isVeg
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                                  : 'bg-slate-700 border-slate-600 text-slate-400'
                                }`}
                  >
                    🔴 Non-veg
                  </button>
                </div>
              </div>
            </div>

            {/* ── PRICE + QUANTITY ─────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Price (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                  min="0"
                  step="0.01"
                  className={`w-full bg-slate-700 border rounded-xl
                              px-4 py-3 text-white placeholder-slate-500
                              focus:outline-none text-sm transition-colors
                              ${errors.price
                                ? 'border-rose-500'
                                : 'border-slate-600 focus:border-amber-500'
                              }`}
                />
                {errors.price && (
                  <p className="mt-1 text-rose-400 text-xs">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Available Qty <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  min="0"
                  className={`w-full bg-slate-700 border rounded-xl
                              px-4 py-3 text-white placeholder-slate-500
                              focus:outline-none text-sm transition-colors
                              ${errors.availableQuantity
                                ? 'border-rose-500'
                                : 'border-slate-600 focus:border-amber-500'
                              }`}
                />
                {errors.availableQuantity && (
                  <p className="mt-1 text-rose-400 text-xs">
                    {errors.availableQuantity}
                  </p>
                )}
              </div>
            </div>

            {/* ── CALORIES + PREP TIME ─────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="e.g., 350"
                  min="0"
                  className="w-full bg-slate-700 border border-slate-600
                             rounded-xl px-4 py-3 text-white
                             placeholder-slate-500 focus:outline-none
                             focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium
                                  text-slate-300 mb-2">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  placeholder="e.g., 15"
                  min="0"
                  className="w-full bg-slate-700 border border-slate-600
                             rounded-xl px-4 py-3 text-white
                             placeholder-slate-500 focus:outline-none
                             focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* ── DATE ─────────────────────────── */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Available Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-3 text-white
                           focus:outline-none focus:border-amber-500
                           text-sm"
              />
            </div>

            {/* ── TAGS ─────────────────────────── */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., spicy, popular, new"
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-3 text-white
                           placeholder-slate-500 focus:outline-none
                           focus:border-amber-500 text-sm"
              />
            </div>

            {/* ── ACTION BUTTONS ───────────────── */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600
                           text-white rounded-xl font-medium text-sm
                           transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`flex-1 py-3 rounded-xl font-semibold
                            text-white text-sm flex items-center
                            justify-center gap-2 transition-all
                            ${loading
                              ? 'bg-slate-600 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-600'
                            }`}
              >
                {loading ? (
                  <>
                    <Loader size="sm" text="" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MdSave size={18} />
                    {editItem ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────
// MAIN MANAGE MENU PAGE
// ─────────────────────────────────────────────
const ManageMenu = () => {
  const [menuItems, setMenuItems]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [deletingId, setDeletingId]   = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') ||
                     'http://localhost:5000'

  // Fetch vendor's menu items on load
  useEffect(() => {
    fetchMenu()
  }, [categoryFilter])

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const params = {}
      if (categoryFilter !== 'All') params.category = categoryFilter

      const response = await menuService.getVendorMenu(params)
      if (response.data.success) {
        setMenuItems(response.data.menuItems)
      }
    } catch (error) {
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  // Open modal for adding new item
  const handleAddNew = () => {
    setEditItem(null)
    setModalOpen(true)
  }

  // Open modal for editing existing item
  const handleEdit = (item) => {
    setEditItem(item)
    setModalOpen(true)
  }

  // Delete a menu item
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item? This cannot be undone.')) return

    setDeletingId(id)
    try {
      await menuService.deleteMenuItem(id)
      toast.success('Menu item deleted')
      fetchMenu()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  // Toggle item availability
  const handleToggleAvailability = async (item) => {
    try {
      const formData = new FormData()
      formData.append('isAvailable', !item.isAvailable)

      await menuService.updateMenuItem(item._id, formData)
      toast.success(
        item.isAvailable ? 'Item marked unavailable' : 'Item marked available'
      )
      fetchMenu()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ──────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start
                      sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Manage Menu 🍽️
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {menuItems.length} items in your menu
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={fetchMenu}
            className="p-3 bg-slate-800 border border-slate-700
                       rounded-xl text-slate-400 hover:text-white
                       transition-colors"
          >
            <MdRefresh size={20} />
          </button>

          {/* Add New Item Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-amber-500
                       hover:bg-amber-600 text-white px-5 py-3
                       rounded-xl font-semibold text-sm
                       transition-colors shadow-lg shadow-amber-500/25"
          >
            <MdAdd size={20} />
            Add Menu Item
          </motion.button>
        </div>
      </div>

      {/* ── CATEGORY FILTER ──────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium
                        whitespace-nowrap transition-all duration-200
                        flex-shrink-0
                        ${categoryFilter === cat
                          ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                        }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── MENU ITEMS GRID ──────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" text="Loading menu..." />
        </div>
      ) : menuItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-slate-800/30 rounded-2xl
                     border border-dashed border-slate-700"
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Menu Items Yet
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Start by adding your first menu item for today
          </p>
          <button
            onClick={handleAddNew}
            className="bg-amber-500 hover:bg-amber-600 text-white
                       px-6 py-3 rounded-xl font-medium text-sm
                       transition-colors"
          >
            Add First Item
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {menuItems.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1  }}
                exit={{ opacity: 0, scale: 0.9   }}
                transition={{ delay: i * 0.05 }}
                className={`bg-slate-800/50 border rounded-2xl
                            overflow-hidden transition-all duration-300
                            ${item.isAvailable
                              ? 'border-slate-700/50 hover:border-amber-500/30'
                              : 'border-slate-700/30 opacity-60'
                            }`}
              >
                {/* Item Image */}
                <div className="relative h-44 bg-slate-700 overflow-hidden">
                  {item.image ? (
                    <img
                      src={`${backendUrl}${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center text-5xl">
                      {item.category === 'Breakfast' ? '🍳' :
                       item.category === 'Lunch' ? '🍛' :
                       item.category === 'Beverages' ? '☕' :
                       item.category === 'Desserts' ? '🍰' : '🍜'}
                    </div>
                  )}

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-slate-900/80
                                   text-white text-xs px-2.5 py-1
                                   rounded-full backdrop-blur-sm">
                    {item.category}
                  </span>

                  {/* Veg indicator */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded
                                   border-2 bg-slate-900/80 flex items-center
                                   justify-center
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

                  {/* Unavailable overlay */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/60
                                    flex items-center justify-center">
                      <span className="bg-rose-500 text-white text-xs
                                       font-bold px-3 py-1 rounded-full">
                        UNAVAILABLE
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold text-base
                                   leading-tight">
                      {item.title}
                    </h3>
                    <span className="text-amber-400 font-bold
                                     text-lg flex-shrink-0">
                      ₹{item.price}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-xs leading-relaxed
                                  mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs
                                  text-slate-400 mb-4">
                    <span>📦 {item.availableQuantity} left</span>
                    {item.preparationTime > 0 && (
                      <span>⏱️ {item.preparationTime}m</span>
                    )}
                    {item.calories > 0 && (
                      <span>🔥 {item.calories}cal</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* Toggle Availability */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1.5 px-3 py-2
                                  rounded-xl text-xs font-medium
                                  transition-colors flex-1 justify-center
                                  ${item.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  }`}
                    >
                      {item.isAvailable ? (
                        <><MdCheckCircle size={14} /> Available</>
                      ) : (
                        <><MdCancel size={14} /> Unavailable</>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2.5 bg-amber-500/10 text-amber-400
                                 hover:bg-amber-500/20 rounded-xl
                                 border border-amber-500/30
                                 transition-colors"
                    >
                      <MdEdit size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="p-2.5 bg-rose-500/10 text-rose-400
                                 hover:bg-rose-500/20 rounded-xl
                                 border border-rose-500/30
                                 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item._id ? (
                        <Loader size="sm" text="" />
                      ) : (
                        <MdDelete size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Menu Item Modal */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={fetchMenu}
        editItem={editItem}
      />
    </div>
  )
}

export default ManageMenu