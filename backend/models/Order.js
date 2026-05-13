// =============================================
// models/Order.js - Order Schema
// =============================================

import mongoose from 'mongoose';

// ─────────────────────────────────────────────
// ORDER ITEM SUB-SCHEMA
// ─────────────────────────────────────────────
// Each order has MULTIPLE items
// We define the structure of each item here

const orderItemSchema = new mongoose.Schema({
  // Reference to which menu item was ordered
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',       // Links to MenuItem collection
    required: true,
  },

  // Snapshot of item details at time of order
  // We store these separately because menu prices can change
  // This preserves the historical record
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    default: '',
  },

  // How many of this item did the student order?
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },

  // Price × Quantity for this item
  subtotal: {
    type: Number,
    required: true,
  },
});

// ─────────────────────────────────────────────
// MAIN ORDER SCHEMA
// ─────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── WHO PLACED THE ORDER ───────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',           // Links to User collection
      required: [true, 'Student is required'],
    },

    // ── WHO WILL FULFILL THE ORDER ─────────────
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',         // Links to Vendor collection
      required: [true, 'Vendor is required'],
    },

    // ── ORDER ITEMS ────────────────────────────
    // Array of orderItemSchema objects
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0; // At least 1 item required
        },
        message: 'Order must have at least one item',
      },
    },

    // ── PRICING ────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Any discount applied
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final amount student pays
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── ORDER STATUS ───────────────────────────
    // Tracks where the order is in the process
    status: {
      type: String,
      enum: {
        values: [
          'pending',    // Just placed, waiting for vendor
          'accepted',   // Vendor accepted the order
          'preparing',  // Food is being cooked
          'ready',      // Food is ready for pickup
          'completed',  // Student picked up food
          'cancelled',  // Order was cancelled
          'rejected',   // Vendor rejected the order
        ],
        message: 'Invalid order status',
      },
      default: 'pending', // All new orders start as pending
    },

    // ── PAYMENT ────────────────────────────────
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'unpaid',
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'wallet'],
      default: 'cash',
    },

    // ── SPECIAL INSTRUCTIONS ───────────────────
    // Student can add notes like "no spicy", "extra sugar"
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [200, 'Instructions cannot exceed 200 characters'],
      default: '',
    },

    // ── PICKUP TIME ────────────────────────────
    // When does the student want to pick up the food?
    pickupTime: {
      type: String,   // Format: "13:00" (1 PM)
      default: '',
    },

    // ── ORDER TRACKING TIMESTAMPS ──────────────
    // Track exactly when each status changed
    orderDate: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: Date,    // When vendor accepted
    readyAt: Date,       // When food was ready
    completedAt: Date,   // When student picked up

    // ── CANCELLATION ───────────────────────────
    cancelledBy: {
      type: String,
      enum: ['student', 'vendor', 'admin', null],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ─────────────────────────────────────────────
// INDEXES for faster queries
// ─────────────────────────────────────────────
orderSchema.index({ student: 1, orderDate: -1 }); // Student's orders, newest first
orderSchema.index({ vendor: 1, status: 1 });       // Vendor's orders by status
orderSchema.index({ status: 1 });                  // Query by status
orderSchema.index({ orderDate: -1 });              // Sort by date

const Order = mongoose.model('Order', orderSchema);

export default Order;