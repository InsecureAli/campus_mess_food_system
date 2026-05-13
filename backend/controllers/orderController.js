// =============================================
// controllers/orderController.js
// =============================================

import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Vendor from '../models/Vendor.js';

// ─────────────────────────────────────────────
// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Student only)
// ─────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { items, vendorId, specialInstructions, pickupTime, paymentMethod } = req.body;

  // Validate items array
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  if (!vendorId) {
    res.status(400);
    throw new Error('Vendor ID is required');
  }

  // ── Process Each Order Item ──────────────────
  let orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    // Find the actual menu item in database
    const menuItem = await MenuItem.findById(item.menuItemId);

    if (!menuItem) {
      res.status(404);
      throw new Error(`Menu item not found: ${item.menuItemId}`);
    }

    // Check if item is still available
    if (!menuItem.isAvailable) {
      res.status(400);
      throw new Error(`${menuItem.title} is no longer available`);
    }

    // Check if enough quantity is available
    if (menuItem.availableQuantity < item.quantity) {
      res.status(400);
      throw new Error(
        `Only ${menuItem.availableQuantity} portions of ${menuItem.title} available`
      );
    }

    // Calculate subtotal for this item
    const itemSubtotal = menuItem.price * item.quantity;
    subtotal += itemSubtotal;

    // Build order item with snapshot of current prices
    orderItems.push({
      menuItem: menuItem._id,
      title: menuItem.title,
      price: menuItem.price,
      image: menuItem.image,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });

    // Reduce available quantity
    menuItem.availableQuantity -= item.quantity;
    if (menuItem.availableQuantity === 0) {
      menuItem.isAvailable = false;
    }
    await menuItem.save();
  }

  // Calculate total price (could add delivery fee, tax, etc.)
  const totalPrice = subtotal;

  // ── Create Order in Database ─────────────────
  const order = await Order.create({
    student: req.user._id,
    vendor: vendorId,
    items: orderItems,
    subtotal,
    totalPrice,
    specialInstructions: specialInstructions || '',
    pickupTime: pickupTime || '',
    paymentMethod: paymentMethod || 'cash',
    status: 'pending',
    paymentStatus: 'unpaid',
    orderDate: new Date(),
  });

  // Update vendor's total orders count
  await Vendor.findByIdAndUpdate(vendorId, {
    $inc: { totalOrders: 1 }, // Increment totalOrders by 1
  });

  // Populate order data for response
  const populatedOrder = await Order.findById(order._id)
    .populate('student', 'name email phone')
    .populate('vendor', 'vendorName messName phone')
    .populate('items.menuItem', 'title image category');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! 🎉',
    order: populatedOrder,
  });
});

// ─────────────────────────────────────────────
// @desc    Get student's own orders
// @route   GET /api/orders/my-orders
// @access  Private (Student)
// ─────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { student: req.user._id }; // Only this student's orders

  if (status) query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const orders = await Order.find(query)
    .populate('vendor', 'vendorName messName phone')
    .populate('items.menuItem', 'title image category')
    .sort({ orderDate: -1 }) // Newest orders first
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// ─────────────────────────────────────────────
// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
// ─────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('student', 'name email phone studentId')
    .populate('vendor', 'vendorName messName phone address')
    .populate('items.menuItem', 'title image category');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Security: Students can only view their own orders
  // Vendors can view orders for their mess
  // Admin can view all orders
  const isStudent = req.userRole === 'student';
  const isOwnerStudent = order.student._id.toString() === req.user._id.toString();
  const isOwnerVendor = order.vendor._id.toString() === req.user._id.toString();
  const isAdmin = req.userRole === 'admin';

  if (isStudent && !isOwnerStudent) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  if (req.userRole === 'vendor' && !isOwnerVendor) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ─────────────────────────────────────────────
// @desc    Get vendor's received orders
// @route   GET /api/orders/vendor-orders
// @access  Private (Vendor only)
// ─────────────────────────────────────────────
export const getVendorOrders = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;

  const query = { vendor: req.user._id };

  if (status) query.status = status;

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.orderDate = { $gte: startDate, $lte: endDate };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const orders = await Order.find(query)
    .populate('student', 'name email phone studentId department')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  // Count orders by status for quick stats
  const stats = await Order.aggregate([
    { $match: { vendor: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    stats,
    orders,
  });
});

// ─────────────────────────────────────────────
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor or Admin)
// ─────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  // Valid status transitions
  const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Vendors can only update their own orders
  if (req.userRole === 'vendor' &&
    order.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  // Update status and add timestamp
  order.status = status;

  // Track timestamps for each status change
  if (status === 'accepted') order.acceptedAt = new Date();
  if (status === 'ready') order.readyAt = new Date();
  if (status === 'completed') {
    order.completedAt = new Date();
    order.paymentStatus = 'paid';

    // Update vendor's total earnings
    await Vendor.findByIdAndUpdate(order.vendor, {
      $inc: { totalEarnings: order.totalPrice },
    });
  }

  if (status === 'cancelled' || status === 'rejected') {
    order.cancellationReason = cancellationReason || '';
    order.cancelledBy = req.userRole;

    // Restore menu item quantities
    for (const item of order.items) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { availableQuantity: item.quantity },
        isAvailable: true,
      });
    }
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('student', 'name email phone')
    .populate('vendor', 'vendorName messName');

  res.status(200).json({
    success: true,
    message: `Order status updated to: ${status}`,
    order: updatedOrder,
  });
});

// ─────────────────────────────────────────────
// @desc    Cancel order (by student)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Student)
// ─────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Students can only cancel their own orders
  if (order.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // Can only cancel pending orders
  if (!['pending', 'accepted'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  order.status = 'cancelled';
  order.cancelledBy = 'student';
  order.cancellationReason = req.body.reason || 'Cancelled by student';

  // Restore quantities
  for (const item of order.items) {
    await MenuItem.findByIdAndUpdate(item.menuItem, {
      $inc: { availableQuantity: item.quantity },
      isAvailable: true,
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});