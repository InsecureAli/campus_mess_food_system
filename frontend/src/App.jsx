// =============================================
// App.jsx - Root Application Component
// =============================================

import React from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

// App.jsx wraps everything with:
// 1. AuthProvider  → Global authentication state
// 2. CartProvider  → Global shopping cart state
// 3. AppRoutes     → All page routes

const App = () => {
  return (
    // AuthProvider must wrap everything because
    // CartProvider might need auth info
    <AuthProvider>
      <CartProvider>
        {/* All our routes and pages render here */}
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}

export default App