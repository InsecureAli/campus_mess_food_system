// =============================================
// controllers/adminController.js
// =============================================

// =============================================
// controllers/adminController.js - FIXED
// =============================================

import asyncHandler from 'express-async-handler';
import User     from '../models/User.js';
import Vendor   from '../models/Vendor.js';
import MenuItem from '../models/MenuItem.js';  // ✅ ADD THIS
import Order    from '../models/Order.js';      // ✅ ADD THIS
// ─────────────────────────────────────────────
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Run all queries in PARALLEL for better performance
  const [
    totalStudents,
    totalVendors,
    totalOrders,
    totalMenuItems,
    pendingVendors,
    recentOrders,
    ordersByStatus,
    revenue,
  ] = await Promise.all([
    // Count all students
    User.countDocuments({ role: 'student' }),
    
    // Count all vendors
    Vendor.countDocuments(),
    
    // Count all orders
    Order.countDocuments(),
    
    // Count all menu items
    MenuItem.countDocuments(),
    
    // Vendors waiting for approval
    Vendor.countDocuments({ isApproved: false }),
    
    // Last 5 orders
    Order.find()
      .populate('student', 'name email')
      .populate('vendor', 'vendorName messName')
      .sort({ orderDate: -1 })
      .limit(5),
    
    // Orders grouped by status
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    
    // Total revenue (sum of all completed order prices)
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        orderDate: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalStudents,
      totalVendors,
      totalOrders,
      totalMenuItems,
      pendingVendors,
      totalRevenue: revenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
      monthlyRevenue,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Get all users (students + admins)
// @route   GET /api/admin/users
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    users,
  });
});

// ─────────────────────────────────────────────
// @desc    Ban or unban a user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const toggleUserBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Toggle ban status
  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBanned
      ? 'User has been banned'
      : 'User has been unbanned',
    isBanned: user.isBanned,
  });
});

// ─────────────────────────────────────────────
// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// ─────────────────────────────────────────────
// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const getAllVendors = asyncHandler(async (req, res) => {
  const { isApproved, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  if (search) {
    query.$or = [
      { vendorName: { $regex: search, $options: 'i' } },
      { messName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const vendors = await Vendor.find(query)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Vendor.countDocuments(query);

  res.status(200).json({
    success: true,
    count: vendors.length,
    total,
    pages: Math.ceil(total / limitNum),
    vendors,
  });
});

// ─────────────────────────────────────────────
// @desc    Approve or reject vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private (Admin)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// @desc    Approve or revoke vendor approval
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  const { isApproved } = req.body;

  // Update vendor approval status
  vendor.isApproved = isApproved;
  await vendor.save();

  // ✅ CASCADE EFFECT: Handle menu items and orders
  if (!isApproved) {
    // ── REVOKE: Hide all vendor's menu items ────
    // When approval is revoked, mark ALL their menu
    // items as unavailable so they won't appear
    // even if the filter has any edge case

    await MenuItem.updateMany(
      { vendor: vendor._id },   // Find all items by this vendor
      {
        $set: {
          isAvailable: false,   // Mark as unavailable
        },
      }
    );

    // ── REVOKE: Cancel all pending/accepted orders ─
    // Students with pending orders from this vendor
    // should have their orders cancelled automatically

    const pendingOrders = await Order.find({
      vendor: vendor._id,
      status: { $in: ['pending', 'accepted', 'preparing'] },
    });

    // Update each pending order to cancelled
    if (pendingOrders.length > 0) {
      await Order.updateMany(
        {
          vendor: vendor._id,
          status: { $in: ['pending', 'accepted', 'preparing'] },
        },
        {
          $set: {
            status:             'cancelled',
            cancelledBy:        'admin',
            cancellationReason: 'Vendor approval has been revoked by admin',
          },
        }
      );

      // Restore menu item quantities for cancelled orders
      for (const order of pendingOrders) {
        for (const item of order.items) {
          await MenuItem.findByIdAndUpdate(item.menuItem, {
            $inc: { availableQuantity: item.quantity },
          });
        }
      }
    }

    console.log(
      `⚠️  Vendor ${vendor.vendorName} revoked. ` +
      `Menu items hidden. ${pendingOrders.length} orders cancelled.`
    );

  } else {
    // ── APPROVE: Re-enable vendor's menu items ───
    // When vendor is approved (or re-approved),
    // restore their menu items to available
    // Only restore items that were previously available

    await MenuItem.updateMany(
      { vendor: vendor._id },
      {
        $set: {
          isAvailable: true,
        },
      }
    );

    console.log(
      `✅ Vendor ${vendor.vendorName} approved. Menu items restored.`
    );
  }

  res.status(200).json({
    success: true,
    message: isApproved
      ? `${vendor.vendorName} has been approved ✅`
      : `${vendor.vendorName} approval has been revoked ❌`,
    vendor,
    cascadeInfo: isApproved
      ? 'Menu items are now visible to students'
      : 'Menu items hidden and pending orders cancelled',
  });
});
// ─────────────────────────────────────────────
// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const orders = await Order.find(query)
    .populate('student', 'name email')
    .populate('vendor', 'vendorName messName')
    .sort({ orderDate: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// ─────────────────────────────────────────────
// @desc    Ban or unban a vendor
// @route   PUT /api/admin/vendors/:id/ban
// @access  Private (Admin)
// ─────────────────────────────────────────────
export const toggleVendorBan = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Toggle ban status
  vendor.isBanned = !vendor.isBanned;
  await vendor.save();

  // ✅ CASCADE: Hide/Show menu items when ban status changes
  if (vendor.isBanned) {
    // Vendor is now banned → hide their menu items
    await MenuItem.updateMany(
      { vendor: vendor._id },
      { $set: { isAvailable: false } }
    );

    // Cancel their pending orders
    await Order.updateMany(
      {
        vendor: vendor._id,
        status: { $in: ['pending', 'accepted', 'preparing'] },
      },
      {
        $set: {
          status:             'cancelled',
          cancelledBy:        'admin',
          cancellationReason: 'Vendor has been banned',
        },
      }
    );
  } else {
    // Vendor is unbanned → restore their menu items
    // (only if they are also approved)
    if (vendor.isApproved) {
      await MenuItem.updateMany(
        { vendor: vendor._id },
        { $set: { isAvailable: true } }
      );
    }
  }

  res.status(200).json({
    success:  true,
    message:  vendor.isBanned
      ? `${vendor.vendorName} has been banned 🚫`
      : `${vendor.vendorName} has been unbanned ✅`,
    isBanned: vendor.isBanned,
  });
});