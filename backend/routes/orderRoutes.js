// =============================================
// routes/orderRoutes.js
// =============================================

import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Place a new order (students only)
router.post(
  '/',
  protect,
  authorizeRoles('student'),
  createOrder
);

// Get student's own orders
router.get(
  '/my-orders',
  protect,
  authorizeRoles('student'),
  getMyOrders
);

// Get vendor's received orders
router.get(
  '/vendor-orders',
  protect,
  authorizeRoles('vendor'),
  getVendorOrders
);

// Get single order by ID
router.get(
  '/:id',
  protect,
  getOrderById
);

// Update order status (vendor or admin)
router.put(
  '/:id/status',
  protect,
  authorizeRoles('vendor', 'admin'),
  updateOrderStatus
);

// Cancel order (student)
router.put(
  '/:id/cancel',
  protect,
  authorizeRoles('student'),
  cancelOrder
);

export default router;