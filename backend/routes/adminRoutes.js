// =============================================
// routes/adminRoutes.js - FIXED VERSION
// =============================================

import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserBan,
  deleteUser,
  getAllVendors,
  approveVendor,
  toggleVendorBan,   // ✅ NEW import
  getAllOrders,
} from '../controllers/adminController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require login + admin role
router.use(protect);
router.use(authorizeRoles('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users',          getAllUsers);
router.put('/users/:id/ban',  toggleUserBan);
router.delete('/users/:id',   deleteUser);

// Vendor management
router.get('/vendors',                getAllVendors);
router.put('/vendors/:id/approve',    approveVendor);
router.put('/vendors/:id/ban',        toggleVendorBan);  // ✅ NEW route

// Order management
router.get('/orders', getAllOrders);

export default router;