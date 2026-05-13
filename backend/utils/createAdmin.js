import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import User from "../models/User.js";

// Fix __dirname (IMPORTANT for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env correctly (ABSOLUTE PATH SAFE)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const createAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    // Connect to DB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check existing admin
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: "Campus Admin",
      email: "admin@campus.edu",
      password: "Admin@123",
      role: "admin",
      phone: "9999999999",
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();