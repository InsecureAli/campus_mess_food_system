// =============================================
// routes/orderRoutes.js - FIXED VERSION
// =============================================
// SECURITY FIX: Vendor order routes now require
// approval before managing orders

import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';

import {
  protect,
  authorizeRoles,
  isVendorApproved,   // ← Added for vendor routes
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ══════════════════════════════════════════════
// STUDENT ROUTES
// ══════════════════════════════════════════════

// POST /api/orders → Place a new order (students only)
router.post(
  '/',
  protect,
  authorizeRoles('student'),
  createOrder
);

// GET /api/orders/my-orders → Get student's own orders
router.get(
  '/my-orders',
  protect,
  authorizeRoles('student'),
  getMyOrders
);

// PUT /api/orders/:id/cancel → Student cancels order
router.put(
  '/:id/cancel',
  protect,
  authorizeRoles('student'),
  cancelOrder
);

// ══════════════════════════════════════════════
// VENDOR ROUTES
// ALL require: login + vendor role + APPROVED status
// ══════════════════════════════════════════════

// GET /api/orders/vendor-orders → Get vendor's received orders
router.get(
  '/vendor-orders',
  protect,
  authorizeRoles('vendor'),
  isVendorApproved,   // ✅ FIXED: Must be approved to see orders
  getVendorOrders
);

// PUT /api/orders/:id/status → Update order status
router.put(
  '/:id/status',
  protect,
  authorizeRoles('vendor', 'admin'),
  isVendorApproved,   // ✅ FIXED: Vendor must be approved
  updateOrderStatus
);

// ══════════════════════════════════════════════
// SHARED ROUTES (Student + Vendor + Admin)
// ══════════════════════════════════════════════

// GET /api/orders/:id → Get single order by ID
// This is AFTER specific routes to avoid conflicts
router.get(
  '/:id',
  protect,
  getOrderById
);

export default router;