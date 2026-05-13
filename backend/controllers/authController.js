// =============================================
// controllers/authController.js
// =============================================
// Controllers contain the BUSINESS LOGIC
// They process requests and send responses
// Routes call controllers, controllers do the work

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import generateToken from '../utils/generateToken.js';

// ─────────────────────────────────────────────
// @desc    Register a new Student
// @route   POST /api/auth/register
// @access  Public (no login required)
// ─────────────────────────────────────────────
export const registerStudent = asyncHandler(async (req, res) => {
  // Step 1: Extract data from request body
  // req.body contains the JSON data sent from frontend
  const { name, email, password, phone, studentId, department, semester } = req.body;

  // Step 2: Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  // Step 3: Check if email already exists in database
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered. Please login instead');
  }

  // Step 4: Create new user in database
  // Password will be automatically hashed by pre-save middleware
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,           // Will be hashed by mongoose pre-save hook
    phone: phone || '',
    studentId: studentId || '',
    department: department || '',
    semester: semester || null,
    role: 'student',    // Always student when registering here
  });

  // Step 5: If user was created successfully
  if (user) {
    // Generate JWT token and set cookie
    const token = generateToken(res, user._id, user.role);

    // Step 6: Send success response
    // We send back user info (without password)
    res.status(201).json({ // 201 = Created
      success: true,
      message: 'Registration successful! Welcome to Campus Mess System 🎉',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        department: user.department,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data. Registration failed');
  }
});

// ─────────────────────────────────────────────
// @desc    Register a new Vendor
// @route   POST /api/auth/register/vendor
// @access  Public
// ─────────────────────────────────────────────
export const registerVendor = asyncHandler(async (req, res) => {
  const {
    vendorName,
    email,
    password,
    messName,
    messDescription,
    phone,
    address,
    openingTime,
    closingTime,
    cuisineTypes,
  } = req.body;

  // Validate required fields
  if (!vendorName || !email || !password || !messName) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if vendor email already exists
  const existingVendor = await Vendor.findOne({ email: email.toLowerCase() });
  
  if (existingVendor) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Create vendor
  const vendor = await Vendor.create({
    vendorName: vendorName.trim(),
    email: email.toLowerCase().trim(),
    password,
    messName: messName.trim(),
    messDescription: messDescription || '',
    phone: phone || '',
    address: address || '',
    openingTime: openingTime || '08:00',
    closingTime: closingTime || '22:00',
    cuisineTypes: cuisineTypes || ['North Indian'],
    isApproved: false, // Needs admin approval
  });

  if (vendor) {
    const token = generateToken(res, vendor._id, 'vendor');

    res.status(201).json({
      success: true,
      message: 'Vendor registration successful! Please wait for admin approval.',
      token,
      vendor: {
        _id: vendor._id,
        vendorName: vendor.vendorName,
        email: vendor.email,
        messName: vendor.messName,
        phone: vendor.phone,
        isApproved: vendor.isApproved,
        createdAt: vendor.createdAt,
      },
    });
  } else {
    res.status(400);
    throw new Error('Vendor registration failed');
  }
});

// ─────────────────────────────────────────────
// @desc    Login User (Student or Admin)
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user in database
  // .select('+password') explicitly includes password
  // (because we set select: false in schema)
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  // Check if user exists AND password is correct
  if (!user || !(await user.comparePassword(password))) {
    res.status(401); // 401 = Unauthorized
    throw new Error('Invalid email or password');
  }

  // Check if account is banned
  if (user.isBanned) {
    res.status(403);
    throw new Error('Your account has been suspended. Contact admin.');
  }

  // Check if account is active
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account is deactivated');
  }

  // Generate token and send response
  const token = generateToken(res, user._id, user.role);

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name}! 👋`,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePic: user.profilePic,
      studentId: user.studentId,
      department: user.department,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Login Vendor
// @route   POST /api/auth/login/vendor
// @access  Public
// ─────────────────────────────────────────────
export const loginVendor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find vendor (with password included for comparison)
  const vendor = await Vendor.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  if (!vendor || !(await vendor.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (vendor.isBanned) {
    res.status(403);
    throw new Error('Your vendor account has been suspended');
  }

  const token = generateToken(res, vendor._id, 'vendor');

  res.status(200).json({
    success: true,
    message: `Welcome back, ${vendor.vendorName}! 🍽️`,
    token,
    vendor: {
      _id: vendor._id,
      vendorName: vendor.vendorName,
      email: vendor.email,
      messName: vendor.messName,
      phone: vendor.phone,
      isApproved: vendor.isApproved,
      rating: vendor.rating,
      totalEarnings: vendor.totalEarnings,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Get Current User Profile
// @route   GET /api/auth/profile
// @access  Private (requires login)
// ─────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  // It already has the user data without password
  
  res.status(200).json({
    success: true,
    user: req.user,  // Return the authenticated user's data
  });
});

// ─────────────────────────────────────────────
// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  // Find the user/vendor based on role
  if (req.userRole === 'vendor') {
    const vendor = await Vendor.findById(req.user._id);

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    // Update only the fields that were provided
    vendor.vendorName = req.body.vendorName || vendor.vendorName;
    vendor.messName = req.body.messName || vendor.messName;
    vendor.messDescription = req.body.messDescription || vendor.messDescription;
    vendor.phone = req.body.phone || vendor.phone;
    vendor.address = req.body.address || vendor.address;
    vendor.openingTime = req.body.openingTime || vendor.openingTime;
    vendor.closingTime = req.body.closingTime || vendor.closingTime;
    
    if (req.body.cuisineTypes) {
      vendor.cuisineTypes = req.body.cuisineTypes;
    }

    // If user wants to update password
    if (req.body.password) {
      vendor.password = req.body.password; // Will be hashed by pre-save
    }

    const updatedVendor = await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor: {
        _id: updatedVendor._id,
        vendorName: updatedVendor.vendorName,
        email: updatedVendor.email,
        messName: updatedVendor.messName,
        phone: updatedVendor.phone,
      },
    });

  } else {
    // Update student/admin
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.studentId = req.body.studentId || user.studentId;
    user.department = req.body.department || user.department;
    user.semester = req.body.semester || user.semester;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
      },
    });
  }
});

// ─────────────────────────────────────────────
// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  // Clear the JWT cookie by setting it to empty with past expiry
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry to the past → cookie is deleted
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});