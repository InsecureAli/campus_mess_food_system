// // =============================================
// // server.js - Main Entry Point of Backend
// // =============================================

// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Custom imports
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import menuRoutes from './routes/menuRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// // ─────────────────────────────────────────────
// // 1. ENV
// // ─────────────────────────────────────────────
// dotenv.config();

// // ─────────────────────────────────────────────
// // 2. DB CONNECTION
// // ─────────────────────────────────────────────
// connectDB();

// // ─────────────────────────────────────────────
// // 3. APP INIT
// // ─────────────────────────────────────────────
// const app = express();

// // ─────────────────────────────────────────────
// // 4. MIDDLEWARE
// // ─────────────────────────────────────────────
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:3000',
//     process.env.FRONTEND_URL,
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser());

// // ─────────────────────────────────────────────
// // 5. STATIC FILES
// // ─────────────────────────────────────────────
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ─────────────────────────────────────────────
// // 6. ROOT ROUTE (IMPORTANT)
// // ─────────────────────────────────────────────
// app.get('/', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "🍽️ Campus Mess API is running",
//   });
// });

// // ─────────────────────────────────────────────
// // 7. HEALTH CHECK
// // ─────────────────────────────────────────────
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: '🍽️ Campus Mess Food System API is running!',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//   });
// });

// // ─────────────────────────────────────────────
// // 8. API ROUTES
// // ─────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/admin', adminRoutes);

// // ─────────────────────────────────────────────
// // 9. ERROR HANDLING
// // ─────────────────────────────────────────────
// app.use(notFound);
// app.use(errorHandler);

// // ─────────────────────────────────────────────
// // 10. START SERVER
// // ─────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('🍽️  Campus Mess Food System Backend');
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log(`✅ Server running on port: ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
//   console.log(`🔗 URL: http://localhost:${PORT}`);
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
// });

// // ─────────────────────────────────────────────
// // 11. UNHANDLED REJECTIONS
// // ─────────────────────────────────────────────
// process.on('unhandledRejection', (err) => {
//   console.error(`❌ Unhandled Rejection: ${err.message}`);
//   process.exit(1);
// });

// =============================================
// server.js - Main Entry Point of Backend
// =============================================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────
// 1. ENV (MUST BE FIRST)
// ─────────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────────
// 2. CUSTOM IMPORTS
// ─────────────────────────────────────────────
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ─────────────────────────────────────────────
// 3. DB CONNECTION
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// 4. APP INIT
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// 5. MIDDLEWARE
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─────────────────────────────────────────────
// 6. STATIC FILES
// ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────
// 7. ROOT ROUTE
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍽️ Campus Mess API is running",
  });
});

// ─────────────────────────────────────────────
// 8. HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍽️ Campus Mess Food System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// 9. API ROUTES
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ─────────────────────────────────────────────
// 10. ERROR HANDLING
// ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────
// 11. START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🍽️  Campus Mess Food System Backend");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// ─────────────────────────────────────────────
// 12. GLOBAL ERROR HANDLING
// ─────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});