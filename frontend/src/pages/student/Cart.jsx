// =============================================
// pages/student/Cart.jsx
// =============================================

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdDelete, MdAdd, MdRemove, MdShoppingCart,
         MdArrowBack, MdRestaurantMenu } from 'react-icons/md'
import { useCart } from '../../context/CartContext.jsx'
import { orderService } from '../../services/orderService.js'
import Loader from '../../components/common/Loader.jsx'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cartItems, cartVendor, cartTotal, cartCount,
          updateQuantity, removeFromCart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    if (!cartVendor) {
      toast.error('No vendor selected')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        vendorId: cartVendor._id,
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        specialInstructions,
        pickupTime,
        paymentMethod,
      }

      const response = await orderService.createOrder(orderData)

      if (response.data.success) {
        clearCart()
        toast.success('Order placed successfully! 🎉')
        navigate('/student/orders')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center
                      min-h-[60vh] space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-8xl"
        >
          🛒
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Cart is Empty</h2>
        <p className="text-slate-400">Add items from the menu to get started</p>
        <Link
          to="/student/menu"
          className="flex items-center gap-2 bg-indigo-500
                     hover:bg-indigo-600 text-white px-6 py-3
                     rounded-xl font-medium transition-colors"
        >
          <MdRestaurantMenu size={20} />
          Browse Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/student/menu"
          className="p-2 text-slate-400 hover:text-white
                     hover:bg-slate-700/50 rounded-xl transition-colors"
        >
          <MdArrowBack size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">My Cart</h1>
          <p className="text-slate-400 text-sm">
            {cartCount} item(s) from {cartVendor?.messName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-800/50 border border-slate-700/50
                           rounded-2xl p-5 flex items-center gap-4"
              >
                {/* Food emoji/image */}
                <div className="w-14 h-14 bg-slate-700 rounded-xl
                                flex items-center justify-center
                                text-2xl flex-shrink-0">
                  🍽️
                </div>

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {item.title}
                  </p>
                  <p className="text-slate-400 text-sm">
                    ₹{item.price} each
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600
                               rounded-lg flex items-center justify-center
                               text-white transition-colors"
                  >
                    <MdRemove size={18} />
                  </button>
                  <span className="text-white font-bold w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600
                               rounded-lg flex items-center justify-center
                               text-white transition-colors"
                  >
                    <MdAdd size={18} />
                  </button>
                </div>

                {/* Item total */}
                <div className="text-right">
                  <p className="text-white font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-rose-400 hover:text-rose-300
                               transition-colors mt-1"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear Cart */}
          <button
            onClick={clearCart}
            className="text-rose-400 hover:text-rose-300 text-sm
                       font-medium transition-colors"
          >
            Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-slate-800/50 border border-slate-700/50
                          rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Order Summary</h3>

            {/* Subtotal */}
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item._id}
                     className="flex justify-between text-sm">
                  <span className="text-slate-400 truncate max-w-[140px]">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-slate-300">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-indigo-400">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Options */}
          <div className="bg-slate-800/50 border border-slate-700/50
                          rounded-2xl p-6 space-y-4">
            {/* Pickup Time */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Pickup Time (optional)
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-2.5 text-white text-sm
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-2.5 text-white text-sm
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="cash">Cash on Pickup</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium
                                text-slate-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Less spicy, extra sauce..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600
                           rounded-xl px-4 py-2.5 text-white text-sm
                           placeholder-slate-500 focus:outline-none
                           focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Place Order Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white
                          text-base transition-all duration-200 flex
                          items-center justify-center gap-2
                          ${loading
                            ? 'bg-slate-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                          }`}
            >
              {loading ? (
                <>
                  <Loader size="sm" text="" />
                  Placing Order...
                </>
              ) : (
                <>
                  <MdShoppingCart size={20} />
                  Place Order • ₹{cartTotal.toFixed(2)}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart