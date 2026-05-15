// =============================================
// routes/menuRoutes.js - FIXED VERSION
// =============================================
// SECURITY FIX: All vendor write operations now
// require BOTH authentication AND approval check

import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getVendorMenu,
} from '../controllers/menuController.js';

import {
  protect,
  authorizeRoles,
  isVendorApproved,   // ← This was missing from critical routes
} from '../middleware/authMiddleware.js';

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// ── MULTER CONFIGURATION ─────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// ══════════════════════════════════════════════
// PUBLIC ROUTES (No auth required)
// Students can browse menu without logging in
// ══════════════════════════════════════════════

// GET /api/menu → Browse all menu items
router.get('/', getMenuItems);

// GET /api/menu/:id → Get single menu item
router.get('/:id', getMenuItemById);

// ══════════════════════════════════════════════
// PROTECTED VENDOR ROUTES
// ALL require: login + vendor role + APPROVED status
// ══════════════════════════════════════════════

// GET /api/menu/vendor/my-menu → Vendor views own menu
// NOTE: Even viewing own menu requires approval
// This route must be BEFORE /:id to avoid conflict
router.get(
  '/vendor/my-menu',
  protect,                    // ✅ Must be logged in
  authorizeRoles('vendor'),   // ✅ Must be vendor role
  isVendorApproved,           // ✅ FIXED: Must be approved
  getVendorMenu
);

// POST /api/menu → Add new menu item
router.post(
  '/',
  protect,
  authorizeRoles('vendor'),
  isVendorApproved,           // ✅ FIXED: Must be approved
  upload.single('image'),
  createMenuItem
);

// PUT /api/menu/:id → Update menu item
router.put(
  '/:id',
  protect,
  authorizeRoles('vendor'),
  isVendorApproved,           // ✅ FIXED: Must be approved
  upload.single('image'),
  updateMenuItem
);

// DELETE /api/menu/:id → Delete menu item
router.delete(
  '/:id',
  protect,
  authorizeRoles('vendor', 'admin'), // Admin can also delete
  isVendorApproved,                  // ✅ FIXED: Vendor must be approved
  deleteMenuItem
);

export default router;