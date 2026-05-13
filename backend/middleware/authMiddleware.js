// =============================================
// middleware/authMiddleware.js
// =============================================
// Middleware = functions that run BEFORE route handlers
// These protect our routes from unauthorized access

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

// ─────────────────────────────────────────────
// protect - Verify JWT Token
// ─────────────────────────────────────────────
// This middleware checks if user is logged in
// Add this to any route that requires authentication
//
// Usage: router.get('/profile', protect, getProfile)
//
// What it does:
// 1. Looks for token in cookies OR Authorization header
// 2. Verifies the token is valid
// 3. Finds the user in database
// 4. Attaches user to req.user
// 5. Calls next() to proceed to the route handler

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ── Method 1: Get token from Cookie ──────────
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // ── Method 2: Get token from Authorization Header
  // Format: "Bearer eyJhbGciOiJIUzI1NiJ9..."
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Split "Bearer TOKEN" and get just the TOKEN part
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, user is not logged in
  if (!token) {
    res.status(401); // 401 = Unauthorized
    throw new Error('Not authorized, no token provided');
  }

  try {
    // jwt.verify() decodes and verifies the token
    // If token is invalid or expired, it throws an error
    // decoded contains: { id: '...', role: '...', iat: ..., exp: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Find user based on role ─────────────────
    // Token contains the role, so we know which model to query
    
    if (decoded.role === 'vendor') {
      // Look up vendor in Vendor collection
      req.user = await Vendor.findById(decoded.id).select('-password');
      req.userRole = 'vendor';
    } else {
      // Look up user in User collection (student or admin)
      req.user = await User.findById(decoded.id).select('-password');
      req.userRole = decoded.role;
    }

    // If user not found (maybe deleted after token was issued)
    if (!req.user) {
      res.status(401);
      throw new Error('User not found, token invalid');
    }

    // Check if user/vendor is banned
    if (req.user.isBanned) {
      res.status(403); // 403 = Forbidden
      throw new Error('Your account has been suspended');
    }

    // User is authenticated! Continue to the route handler
    next();

  } catch (error) {
    // Token verification failed (expired or tampered)
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// ─────────────────────────────────────────────
// authorizeRoles - Role-Based Access Control
// ─────────────────────────────────────────────
// After protect() verifies the user is logged in,
// authorizeRoles() checks if they have the RIGHT ROLE
//
// Usage: router.get('/admin', protect, authorizeRoles('admin'), handler)
// Usage: router.post('/menu', protect, authorizeRoles('vendor'), handler)
// Usage: router.post('/order', protect, authorizeRoles('student', 'admin'), handler)

export const authorizeRoles = (...roles) => {
  // This returns a middleware function
  // ...roles = rest parameter = array of allowed roles
  // Example: authorizeRoles('admin', 'vendor') → roles = ['admin', 'vendor']
  
  return (req, res, next) => {
    // req.userRole was set by protect() middleware
    
    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.userRole)) {
      res.status(403); // 403 = Forbidden
      throw new Error(
        `Role '${req.userRole}' is not authorized to access this route`
      );
    }

    // User has the correct role, proceed
    next();
  };
};

// ─────────────────────────────────────────────
// isVendorApproved - Check Vendor Approval
// ─────────────────────────────────────────────
// Vendors must be approved by admin before they can
// add menu items or manage orders

export const isVendorApproved = asyncHandler(async (req, res, next) => {
  // This runs after protect(), so req.user is available
  
  if (req.userRole === 'vendor' && !req.user.isApproved) {
    res.status(403);
    throw new Error('Your vendor account is pending admin approval');
  }
  
  next();
});