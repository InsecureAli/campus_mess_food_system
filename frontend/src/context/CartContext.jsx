// =============================================
// context/CartContext.jsx
// =============================================
// Manages the shopping cart state globally
// Students add food items to cart from menu page
// Then checkout from cart page

import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  // ── CART STATE ────────────────────────────────
  // Load cart from localStorage if it exists
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('campusMessCart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch {
      return []
    }
  })

  // Track which vendor's items are in cart
  // Students can only order from ONE vendor at a time
  const [cartVendor, setCartVendor] = useState(() => {
    try {
      const saved = localStorage.getItem('campusMessCartVendor')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // ── SAVE TO LOCALSTORAGE ON CHANGE ────────────
  // Whenever cartItems changes, save to localStorage
  // This persists cart across page refreshes
  useEffect(() => {
    localStorage.setItem('campusMessCart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('campusMessCartVendor', JSON.stringify(cartVendor))
  }, [cartVendor])

  // ─────────────────────────────────────────────
  // ADD ITEM TO CART
  // ─────────────────────────────────────────────
  const addToCart = (item, vendor) => {
    // Check if cart has items from a DIFFERENT vendor
    // Students cannot mix orders from different vendors
    if (cartVendor && cartVendor._id !== vendor._id) {
      toast.error(
        `Cart has items from ${cartVendor.messName}. Clear cart first to order from ${vendor.messName}`,
        { duration: 5000 }
      )
      return false
    }

    // Check if item is already in cart
    const existingItem = cartItems.find(
      (cartItem) => cartItem._id === item._id
    )

    if (existingItem) {
      // If item exists, increase quantity
      // But check if it doesn't exceed available quantity
      if (existingItem.quantity >= item.availableQuantity) {
        toast.error(`Only ${item.availableQuantity} portions available`)
        return false
      }

      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      )
      toast.success(`${item.title} quantity updated`)
    } else {
      // Add new item to cart
      setCartItems((prev) => [
        ...prev,
        { ...item, quantity: 1 }
      ])

      // Set the vendor for this cart session
      if (!cartVendor) {
        setCartVendor(vendor)
      }

      toast.success(`${item.title} added to cart! 🛒`)
    }

    return true
  }

  // ─────────────────────────────────────────────
  // REMOVE ITEM FROM CART
  // ─────────────────────────────────────────────
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item._id !== itemId)

      // If cart is now empty, clear vendor too
      if (updated.length === 0) {
        setCartVendor(null)
        localStorage.removeItem('campusMessCartVendor')
      }

      return updated
    })
  }

  // ─────────────────────────────────────────────
  // UPDATE ITEM QUANTITY
  // ─────────────────────────────────────────────
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: Math.min(quantity, item.availableQuantity) }
          : item
      )
    )
  }

  // ─────────────────────────────────────────────
  // CLEAR ENTIRE CART
  // ─────────────────────────────────────────────
  const clearCart = () => {
    setCartItems([])
    setCartVendor(null)
    localStorage.removeItem('campusMessCart')
    localStorage.removeItem('campusMessCartVendor')
  }

  // ─────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────

  // Total number of items in cart (sum of all quantities)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Total price of all items in cart
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Is cart empty?
  const isCartEmpty = cartItems.length === 0

  // ─────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────
  const contextValue = {
    cartItems,
    cartVendor,
    cartCount,
    cartTotal,
    isCartEmpty,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook for easy access
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}