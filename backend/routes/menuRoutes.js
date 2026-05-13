// =============================================
// routes/menuRoutes.js
// =============================================

import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getVendorMenu,
} from '../controllers/menuController.js';

import { protect, authorizeRoles, isVendorApproved } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// ── MULTER CONFIGURATION FOR IMAGE UPLOADS ──────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure where and how to store uploaded files
const storage = multer.diskStorage({
  // destination: where to save uploaded files
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  // filename: what to name the uploaded file
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-originalname
    // Example: 1703123456789-burger.jpg
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

// File filter: only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size
  fileFilter: fileFilter,
});

// ── PUBLIC ROUTES ────────────────────────────────

// Get all menu items (students browse here)
router.get('/', getMenuItems);

// Get vendor's own menu items
router.get(
  '/vendor/my-menu',
  protect,
  authorizeRoles('vendor'),
  getVendorMenu
);

// Get single menu item
router.get('/:id', getMenuItemById);

// ── PROTECTED VENDOR ROUTES ──────────────────────

// Create menu item (vendor only, must be approved)
router.post(
  '/',
  protect,                          // Must be logged in
  authorizeRoles('vendor'),         // Must be a vendor
  isVendorApproved,                 // Must be approved by admin
  upload.single('image'),           // Handle single image upload
  createMenuItem
);

// Update menu item
router.put(
  '/:id',
  protect,
  authorizeRoles('vendor'),
  isVendorApproved,
  upload.single('image'),
  updateMenuItem
);

// Delete menu item
router.delete(
  '/:id',
  protect,
  authorizeRoles('vendor', 'admin'), // Vendor or admin can delete
  deleteMenuItem
);

export default router;