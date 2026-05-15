// =============================================
// middleware/authMiddleware.js - FIXED VERSION
// =============================================

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

// ─────────────────────────────────────────────
// protect - Verify JWT Token
// ─────────────────────────────────────────────
// Runs before ANY protected route
// Verifies the JWT and attaches user to req.user

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Then check Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role stored in token
    if (decoded.role === 'vendor') {
      req.user     = await Vendor.findById(decoded.id).select('-password');
      req.userRole = 'vendor';
    } else {
      req.user     = await User.findById(decoded.id).select('-password');
      req.userRole = decoded.role; // 'student' or 'admin'
    }

    if (!req.user) {
      res.status(401);
      throw new Error('User not found, token invalid');
    }

    // Check if banned
    if (req.user.isBanned) {
      res.status(403);
      throw new Error('Your account has been suspended. Contact admin.');
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired. Please log in again.');
    }
    // Re-throw our custom errors
    throw error;
  }
});

// ─────────────────────────────────────────────
// authorizeRoles - Role-Based Access Control
// ─────────────────────────────────────────────
// Checks if user has one of the allowed roles
// Usage: authorizeRoles('admin', 'vendor')

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      res.status(403);
      throw new Error(
        `Access denied. Role '${req.userRole}' is not authorized for this action.`
      );
    }
    next();
  };
};

// ─────────────────────────────────────────────
// isVendorApproved - FIXED & STRENGTHENED
// ─────────────────────────────────────────────
// Blocks ALL vendor actions until admin approves
//
// This middleware:
// 1. Checks if the role is 'vendor'
// 2. Verifies their isApproved field is TRUE
// 3. Blocks with 403 if not approved
// 4. Admin bypass: admins can always pass through

export const isVendorApproved = asyncHandler(async (req, res, next) => {

  // ── Admin bypass ──────────────────────────────
  // Admins can always perform vendor-related actions
  // (e.g., admin deleting a menu item)
  if (req.userRole === 'admin') {
    return next();
  }

  // ── Vendor check ─────────────────────────────
  if (req.userRole === 'vendor') {
    // Double-check approval status from DATABASE
    // (not just from the token, which might be stale)
    const vendor = await Vendor.findById(req.user._id).select('isApproved isBanned');

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor account not found.');
    }

    // Check banned status again (extra safety)
    if (vendor.isBanned) {
      res.status(403);
      throw new Error('Your vendor account has been suspended.');
    }

    // ✅ THE MAIN CHECK
    if (!vendor.isApproved) {
      res.status(403);
      throw new Error(
        'Your vendor account is pending admin approval. ' +
        'You cannot perform this action until approved.'
      );
    }

    // Vendor is approved, continue
    return next();
  }

  // For any other role, block access
  res.status(403);
  throw new Error('Access denied.');
});