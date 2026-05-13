// =============================================
// models/MenuItem.js - Food Menu Item Schema
// =============================================

import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    // ── FOOD INFORMATION ───────────────────────
    title: {
      type: String,
      required: [true, 'Please provide food item name'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // ── CATEGORIZATION ─────────────────────────
    category: {
      type: String,
      required: [true, 'Please select a category'],
      // Only these category values are allowed
      enum: {
        values: [
          'Breakfast',
          'Lunch',
          'Dinner',
          'Snacks',
          'Beverages',
          'Desserts',
          'Special',
        ],
        message: 'Please select a valid category',
      },
    },

    // ── FOOD DETAILS ───────────────────────────
    image: {
      type: String,     // URL or file path to food image
      default: '',
    },

    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },

    // How many portions are available today
    availableQuantity: {
      type: Number,
      required: [true, 'Please provide available quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },

    // Is this item currently available to order?
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // ── NUTRITIONAL INFO (Optional) ────────────
    calories: {
      type: Number,
      default: 0,
    },

    isVeg: {
      type: Boolean,
      default: true,    // true = vegetarian, false = non-vegetarian
    },

    preparationTime: {
      type: Number,     // In minutes
      default: 15,
    },

    // ── RELATIONSHIP: Which vendor created this ─
    // ref: 'Vendor' creates a REFERENCE to the Vendor collection
    // This is like a foreign key in SQL databases
    vendor: {
      type: mongoose.Schema.Types.ObjectId,  // MongoDB ID type
      ref: 'Vendor',                         // Points to Vendor model
      required: [true, 'Vendor is required'],
    },

    // ── DATE: When is this menu item available ─
    // Vendors add menu items for specific dates
    date: {
      type: Date,
      required: [true, 'Please provide the date for this menu item'],
      default: Date.now,
    },

    // ── RATINGS ────────────────────────────────
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Array of tags for searching/filtering
    tags: {
      type: [String],  // e.g., ['spicy', 'popular', 'new']
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// INDEX: Speed up common queries
// ─────────────────────────────────────────────
// Indexes make database searches MUCH faster
// We often query by vendor + date + category

// Compound index for common query pattern
menuItemSchema.index({ vendor: 1, date: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;