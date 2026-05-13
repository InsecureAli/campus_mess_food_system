// =============================================
// routes/authRoutes.js
// =============================================
// Routes define the URL patterns and HTTP methods
// They connect URLs to controller functions

import express from 'express';
import {
  registerStudent,
  registerVendor,
  loginUser,
  loginVendor,
  getProfile,
  updateProfile,
  logoutUser,
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

// Create a Router instance
// Router is like a mini Express application for organizing routes
const router = express.Router();

// ── PUBLIC ROUTES (No authentication required) ──

// Student registration: POST /api/auth/register
router.post('/register', registerStudent);

// Vendor registration: POST /api/auth/register/vendor
router.post('/register/vendor', registerVendor);

// Student/Admin login: POST /api/auth/login
router.post('/login', loginUser);

// Vendor login: POST /api/auth/login/vendor
router.post('/login/vendor', loginVendor);

// ── PROTECTED ROUTES (Authentication required) ──

// Get profile: GET /api/auth/profile
// PUT profile: PUT /api/auth/profile
router
  .route('/profile')
  .get(protect, getProfile)      // protect middleware runs first
  .put(protect, updateProfile);

// Logout: POST /api/auth/logout
router.post('/logout', protect, logoutUser);

export default router;