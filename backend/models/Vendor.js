// =============================================
// models/Vendor.js - Vendor/Mess Manager Schema
// =============================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema(
  {
    // ── PERSONAL INFORMATION ───────────────────
    vendorName: {
      type: String,
      required: [true, 'Please provide vendor name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries
    },

    // ── MESS INFORMATION ───────────────────────
    messName: {
      type: String,
      required: [true, 'Please provide mess/canteen name'],
      trim: true,
      maxlength: [100, 'Mess name cannot exceed 100 characters'],
    },

    messDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    messImage: {
      type: String,  // URL to mess/restaurant image
      default: '',
    },

    // ── CONTACT INFORMATION ────────────────────
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number'],
      default: '',
    },

    address: {
      type: String,
      trim: true,
      default: '',
    },

    // ── BUSINESS INFORMATION ───────────────────
    // Opening and closing hours
    openingTime: {
      type: String,  // Format: "08:00"
      default: '08:00',
    },

    closingTime: {
      type: String,  // Format: "22:00"
      default: '22:00',
    },

    // Food categories this vendor offers
    cuisineTypes: {
      type: [String],  // Array of strings
      default: ['North Indian'],
    },

    // ── ACCOUNT STATUS ─────────────────────────
    // Admin must approve vendor before they can operate
    isApproved: {
      type: Boolean,
      default: false,  // Vendors start unapproved
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    // ── ANALYTICS ──────────────────────────────
    // Track total earnings for quick access
    totalEarnings: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    // Rating system
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ─────────────────────────────────────────────
// PRE-SAVE: Hash Password
// ─────────────────────────────────────────────
vendorSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────
// METHOD: Compare Password
// ─────────────────────────────────────────────
vendorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;