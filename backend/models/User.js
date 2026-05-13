// =============================================
// models/User.js - Student/Admin User Schema
// =============================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// USER SCHEMA DEFINITION
// ─────────────────────────────────────────────
// A Schema defines the STRUCTURE of documents
// in a MongoDB collection
// Think of it like a blueprint or template

const userSchema = new mongoose.Schema(
  {
    // ── BASIC INFORMATION ──────────────────────
    name: {
      type: String,       // Data type is text
      required: [true, 'Please provide your name'], // Required field with custom error
      trim: true,         // Remove leading/trailing whitespace
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,       // No two users can have same email
      lowercase: true,    // Store emails in lowercase always
      trim: true,
      // Validate email format using regex
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      // select: false means password will NOT be returned
      // in queries by default (security measure)
      select: false,
    },

    // ── ROLE SYSTEM ────────────────────────────
    // This determines what the user can do
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],  // Only these values allowed
        message: 'Role must be either student or admin',
      },
      default: 'student', // New users are students by default
    },

    // ── CONTACT INFORMATION ────────────────────
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number'],
      default: '',
    },

    // ── PROFILE PICTURE ────────────────────────
    profilePic: {
      type: String,       // Store the URL/path to the image
      default: '',        // Empty means use default avatar
    },

    // ── STUDENT SPECIFIC FIELDS ────────────────
    studentId: {
      type: String,
      trim: true,
      default: '',
    },

    department: {
      type: String,
      trim: true,
      default: '',
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },

    // ── ACCOUNT STATUS ─────────────────────────
    isActive: {
      type: Boolean,
      default: true,     // Account is active by default
    },

    // Admin can ban users by setting this to true
    isBanned: {
      type: Boolean,
      default: false,
    },

    // ── FORGOT PASSWORD FIELDS ─────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    // ── SCHEMA OPTIONS ─────────────────────────
    // timestamps: true automatically adds:
    // - createdAt (when document was created)
    // - updatedAt (when document was last updated)
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE (Password Hashing)
// ─────────────────────────────────────────────
// This runs AUTOMATICALLY before every .save() call
// It hashes the password before storing it in database
// NEVER store plain text passwords!

userSchema.pre('save', async function (next) {
  // 'this' refers to the current user document
  
  // Only hash if password was modified
  // (prevents re-hashing on profile updates)
  if (!this.isModified('password')) {
    return next(); // Skip hashing, move to next middleware
  }

  // Generate a salt (random data added to password before hashing)
  // 12 = cost factor (higher = more secure but slower)
  const salt = await bcrypt.genSalt(12);
  
  // Hash the password with the salt
  // This converts "password123" → "$2a$12$xyz..."
  this.password = await bcrypt.hash(this.password, salt);
  
  next(); // Continue saving the document
});

// ─────────────────────────────────────────────
// INSTANCE METHOD: Compare Passwords
// ─────────────────────────────────────────────
// We add custom methods to user documents
// This method compares entered password with hashed password
// Usage: const isMatch = await user.comparePassword('enteredPassword')

userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare() hashes enteredPassword and compares
  // Returns true if they match, false if not
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────────
// CREATE AND EXPORT THE MODEL
// ─────────────────────────────────────────────
// mongoose.model('User', userSchema) creates a Model
// Model = class that lets us interact with the 'users' collection
// (Mongoose automatically pluralizes 'User' → 'users' collection)

const User = mongoose.model('User', userSchema);

export default User;