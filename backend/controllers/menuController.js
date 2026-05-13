// =============================================
// controllers/menuController.js
// =============================================

import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';

// ─────────────────────────────────────────────
// @desc    Get all menu items (with filters)
// @route   GET /api/menu
// @access  Public
// ─────────────────────────────────────────────
export const getMenuItems = asyncHandler(async (req, res) => {
  // Extract query parameters from URL
  // Example: GET /api/menu?category=Lunch&date=2024-01-15&vendor=xyz
  const {
    category,
    date,
    vendor,
    isAvailable,
    search,
    isVeg,
    sortBy,
    page = 1,      // Default page 1
    limit = 20,    // Default 20 items per page
  } = req.query;

  // Build query object dynamically
  // We only add filters that were actually provided
  const query = {};

  // Filter by category
  if (category && category !== 'All') {
    query.category = category;
  }

  // Filter by date (for today's menu)
  if (date) {
    // Create date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Start of day: 00:00:00

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // End of day: 23:59:59

    query.date = { $gte: startDate, $lte: endDate };
  } else {
    // If no date provided, show today's menu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    query.date = { $gte: today, $lt: tomorrow };
  }

  // Filter by vendor
  if (vendor) {
    query.vendor = vendor;
  }

  // Filter by availability
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  // Filter vegetarian items
  if (isVeg !== undefined) {
    query.isVeg = isVeg === 'true';
  }

  // Search by title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },        // Case-insensitive search
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Sorting options
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sortBy === 'price-asc') sortOption = { price: 1 };
  if (sortBy === 'price-desc') sortOption = { price: -1 };
  if (sortBy === 'rating') sortOption = { rating: -1 };
  if (sortBy === 'popular') sortOption = { totalReviews: -1 };

  // Pagination calculation
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum; // How many docs to skip

  // Execute query with pagination and population
  // .populate('vendor') replaces vendor ID with actual vendor data
  const menuItems = await MenuItem.find(query)
    .populate('vendor', 'vendorName messName phone rating messImage')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // Count total documents for pagination info
  const total = await MenuItem.countDocuments(query);

  res.status(200).json({
    success: true,
    count: menuItems.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    menuItems,
  });
});

// ─────────────────────────────────────────────
// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
// ─────────────────────────────────────────────
export const getMenuItemById = asyncHandler(async (req, res) => {
  // req.params.id = the :id from the URL
  const menuItem = await MenuItem.findById(req.params.id)
    .populate('vendor', 'vendorName messName phone rating address openingTime closingTime');

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  res.status(200).json({
    success: true,
    menuItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Vendor only)
// ─────────────────────────────────────────────
export const createMenuItem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    price,
    availableQuantity,
    isVeg,
    calories,
    preparationTime,
    tags,
    date,
  } = req.body;

  // Validate required fields
  if (!title || !category || !price || !availableQuantity) {
    res.status(400);
    throw new Error('Please provide title, category, price, and quantity');
  }

  // Handle uploaded image (from multer)
  let imageUrl = '';
  if (req.file) {
    // If file was uploaded, create URL path
    imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.image) {
    // If image URL was provided as text
    imageUrl = req.body.image;
  }

  // Create menu item
  // req.user._id = vendor's ID (set by protect middleware)
  const menuItem = await MenuItem.create({
    title: title.trim(),
    description: description?.trim() || '',
    category,
    image: imageUrl,
    price: parseFloat(price),
    availableQuantity: parseInt(availableQuantity),
    isVeg: isVeg !== undefined ? isVeg : true,
    calories: calories ? parseInt(calories) : 0,
    preparationTime: preparationTime ? parseInt(preparationTime) : 15,
    tags: tags || [],
    vendor: req.user._id,  // Vendor who created this
    date: date ? new Date(date) : new Date(), // Today if not specified
  });

  // Populate vendor info before sending response
  const populatedItem = await menuItem.populate('vendor', 'vendorName messName');

  res.status(201).json({
    success: true,
    message: 'Menu item added successfully! 🍽️',
    menuItem: populatedItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Vendor only - own items)
// ─────────────────────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Security: Vendor can only update THEIR OWN menu items
  // Convert ObjectId to string for comparison
  if (menuItem.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this menu item');
  }

  // Handle image update
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`;
  }

  // Update the menu item with new data
  // new: true returns the updated document instead of old one
  const updatedItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { ...req.body },  // Spread all request body fields
    {
      new: true,      // Return updated document
      runValidators: true, // Run schema validations on update
    }
  ).populate('vendor', 'vendorName messName');

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    menuItem: updatedItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Vendor only - own items)
// ─────────────────────────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Verify ownership
  if (menuItem.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this menu item');
  }

  await menuItem.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});

// ─────────────────────────────────────────────
// @desc    Get vendor's own menu items
// @route   GET /api/menu/vendor/my-menu
// @access  Private (Vendor only)
// ─────────────────────────────────────────────
export const getVendorMenu = asyncHandler(async (req, res) => {
  const { date, category } = req.query;

  const query = { vendor: req.user._id }; // Only this vendor's items

  if (category) query.category = category;

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: menuItems.length,
    menuItems,
  });
});