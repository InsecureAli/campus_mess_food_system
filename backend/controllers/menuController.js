// =============================================
// controllers/menuController.js - FIXED VERSION
// =============================================
// BUG FIX: Menu items from revoked/banned vendors
// are now AUTOMATICALLY hidden from students

import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';
import Vendor from '../models/Vendor.js';

// ─────────────────────────────────────────────
// HELPER: Get IDs of all approved + active vendors
// ─────────────────────────────────────────────
// This is the KEY function that fixes the bug.
// We fetch only approved, non-banned vendor IDs
// and use them to filter menu items.
//
// Called before any public menu query so students
// only ever see items from valid vendors.

const getApprovedVendorIds = async () => {
  // Find all vendors that are:
  // 1. isApproved: true  → Admin has approved them
  // 2. isBanned: false   → Not banned by admin
  // 3. isActive: true    → Account is active
  const approvedVendors = await Vendor.find(
    {
      isApproved: true,
      isBanned:   { $ne: true },  // $ne = "not equal" → not banned
      isActive:   { $ne: false }, // not deactivated
    },
    '_id' // Only fetch the _id field (more efficient)
  );

  // Return array of just the IDs
  // e.g. [ObjectId('abc'), ObjectId('def'), ...]
  return approvedVendors.map((v) => v._id);
};

// ─────────────────────────────────────────────
// @desc    Get all menu items (PUBLIC - students browse)
// @route   GET /api/menu
// @access  Public
// ─────────────────────────────────────────────
export const getMenuItems = asyncHandler(async (req, res) => {
  const {
    category,
    date,
    vendor,
    isAvailable,
    search,
    isVeg,
    sortBy,
    page  = 1,
    limit = 20,
  } = req.query;

  // ── STEP 1: Get approved vendor IDs ──────────
  // This is the CORE FIX
  // We only show menu items belonging to approved vendors
  const approvedVendorIds = await getApprovedVendorIds();

  // If NO vendors are approved, return empty result immediately
  if (approvedVendorIds.length === 0) {
    return res.status(200).json({
      success:   true,
      count:     0,
      total:     0,
      page:      1,
      pages:     0,
      menuItems: [],
      message:   'No approved vendors available',
    });
  }

  // ── STEP 2: Build query with vendor filter ────
  const query = {
    // ✅ THE FIX: Only include items from approved vendors
    // $in = "in array" → vendor must be in approvedVendorIds list
    vendor: { $in: approvedVendorIds },
  };

  // If a specific vendor is requested (and they are approved),
  // further filter by that vendor
  if (vendor) {
    // Check if requested vendor is in approved list
    const isVendorApproved = approvedVendorIds.some(
      (id) => id.toString() === vendor
    );

    if (!isVendorApproved) {
      // Requested vendor is not approved → return empty
      return res.status(200).json({
        success:   true,
        count:     0,
        total:     0,
        page:      1,
        pages:     0,
        menuItems: [],
      });
    }

    // Vendor is approved, filter by them
    query.vendor = vendor;
  }

  // Filter by category
  if (category && category !== 'All') {
    query.category = category;
  }

  // Filter by date (show today's menu by default)
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    query.date = { $gte: startDate, $lte: endDate };
  } else {
    // Default: show today's menu only
    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    query.date = { $gte: today, $lt: tomorrow };
  }

  // Filter by availability
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  // Filter vegetarian/non-vegetarian
  if (isVeg !== undefined) {
    query.isVeg = isVeg === 'true';
  }

  // Search by title or description
  if (search) {
    query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // ── STEP 3: Sorting ────────────────────────
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sortBy === 'price-asc')  sortOption = { price: 1         };
  if (sortBy === 'price-desc') sortOption = { price: -1        };
  if (sortBy === 'rating')     sortOption = { rating: -1       };
  if (sortBy === 'popular')    sortOption = { totalReviews: -1 };

  // ── STEP 4: Pagination ─────────────────────
  const pageNum  = parseInt(page);
  const limitNum = parseInt(limit);
  const skip     = (pageNum - 1) * limitNum;

  // ── STEP 5: Execute query ──────────────────
  // .populate('vendor') replaces vendor ID with vendor data
  // But ONLY approved vendor data will appear because we
  // already filtered by approvedVendorIds in the query
  const menuItems = await MenuItem.find(query)
    .populate(
      'vendor',
      'vendorName messName phone rating messImage isApproved isBanned'
    )
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  // ── STEP 6: Extra safety filter ───────────
  // Double-check: filter out any items where vendor
  // somehow got through but is not approved
  // This is a secondary defense layer
  const safeMenuItems = menuItems.filter(
    (item) =>
      item.vendor &&
      item.vendor.isApproved === true &&
      item.vendor.isBanned !== true
  );

  // Count for pagination (use same query)
  const total = await MenuItem.countDocuments(query);

  res.status(200).json({
    success:   true,
    count:     safeMenuItems.length,
    total,
    page:      pageNum,
    pages:     Math.ceil(total / limitNum),
    menuItems: safeMenuItems,
  });
});

// ─────────────────────────────────────────────
// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
// ─────────────────────────────────────────────
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate(
    'vendor',
    'vendorName messName phone rating address openingTime closingTime isApproved isBanned'
  );

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // ✅ FIX: Check vendor approval even for single item view
  if (
    !menuItem.vendor ||
    !menuItem.vendor.isApproved ||
    menuItem.vendor.isBanned
  ) {
    res.status(404);
    throw new Error(
      'This menu item is currently unavailable'
    );
  }

  res.status(200).json({
    success:  true,
    menuItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Create menu item (Vendor only)
// @route   POST /api/menu
// @access  Private (Vendor - approved)
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

  // Handle image upload
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.image) {
    imageUrl = req.body.image;
  }

  // Create menu item
  const menuItem = await MenuItem.create({
    title:             title.trim(),
    description:       description?.trim() || '',
    category,
    image:             imageUrl,
    price:             parseFloat(price),
    availableQuantity: parseInt(availableQuantity),
    isVeg:             isVeg !== undefined ? isVeg === 'true' || isVeg === true : true,
    calories:          calories  ? parseInt(calories)       : 0,
    preparationTime:   preparationTime ? parseInt(preparationTime) : 15,
    tags:              tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    vendor:            req.user._id,
    date:              date ? new Date(date) : new Date(),
  });

  const populatedItem = await menuItem.populate(
    'vendor',
    'vendorName messName'
  );

  res.status(201).json({
    success:  true,
    message:  'Menu item added successfully! 🍽️',
    menuItem: populatedItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Update menu item (Vendor only - own items)
// @route   PUT /api/menu/:id
// @access  Private (Vendor - approved)
// ─────────────────────────────────────────────
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Security: Vendor can only update their OWN items
  if (menuItem.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this menu item');
  }

  // Handle image update
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`;
  }

  const updatedItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  ).populate('vendor', 'vendorName messName');

  res.status(200).json({
    success:  true,
    message:  'Menu item updated successfully',
    menuItem: updatedItem,
  });
});

// ─────────────────────────────────────────────
// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Vendor - own items, or Admin)
// ─────────────────────────────────────────────
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Vendors can only delete their own items
  // Admins can delete any item
  if (
    req.userRole !== 'admin' &&
    menuItem.vendor.toString() !== req.user._id.toString()
  ) {
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
// @access  Private (Vendor - approved only)
// ─────────────────────────────────────────────
export const getVendorMenu = asyncHandler(async (req, res) => {
  const { date, category } = req.query;

  // Only return THIS vendor's own items
  // No approval filter needed here because
  // the middleware already ensures vendor is approved
  const query = { vendor: req.user._id };

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
    success:   true,
    count:     menuItems.length,
    menuItems,
  });
});