// =============================================
// models/User.js - Student/Admin User Schema
// =============================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────
// USER SCHEMA DEFINITION
// ─────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── BASIC INFORMATION ──────────────────────
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ── ROLE SYSTEM ────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["student", "admin"],
        message: "Role must be either student or admin",
      },
      default: "student",
    },

    // ── CONTACT INFORMATION ────────────────────
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
      default: "",
    },

    // ── PROFILE PICTURE ────────────────────────
    profilePic: {
      type: String,
      default: "",
    },

    // ── STUDENT SPECIFIC FIELDS ────────────────
    studentId: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
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
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    // ── PASSWORD RESET ─────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// PASSWORD HASHING MIDDLEWARE (FIXED)
// ─────────────────────────────────────────────

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────
// PASSWORD COMPARISON METHOD
// ─────────────────────────────────────────────

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const User = mongoose.model("User", userSchema);

export default User;