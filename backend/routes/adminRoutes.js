// =============================================
// routes/adminRoutes.js
// =============================================

import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserBan,
  deleteUser,
  getAllVendors,
  approveVendor,
  getAllOrders,
} from '../controllers/adminController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require: login + admin role
// We can apply middleware to ALL routes at once using router.use()
router.use(protect);                   // Must be logged in
router.use(authorizeRoles('admin'));   // Must be admin

// Dashboard statistics
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);
router.delete('/users/:id', deleteUser);

// Vendor management
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);

// Order management
router.get('/orders', getAllOrders);

export default router;