// // =============================================
// // config/db.js - MongoDB Database Connection
// // =============================================

// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     // ✅ Mongoose v6+ - No extra options needed
//     const conn = await mongoose.connect(process.env.MONGO_URI);

//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     console.log(`📦 Database: ${conn.connection.name}`);

//   } catch (error) {
//     console.error(`❌ MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;



import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    const msg = error.message || String(error);
    console.error(`❌ MongoDB Connection Error: ${msg}`);

    if (/ESERVFAIL|queryTxt|ENOTFOUND|getaddrinfo/i.test(msg)) {
      console.error(`
→ DNS could not resolve your Atlas host (common with offline Wi‑Fi, ISP DNS, VPN, or school/corporate networks).
  Try: different network, change system DNS to 1.1.1.1 or 8.8.8.8, or in Atlas use the non-SRV connection string
  (mongodb://host1:27017,...) instead of mongodb+srv://… if your network blocks SRV lookups.
→ Confirm the cluster still exists and is not paused in MongoDB Atlas.`);
    }

    process.exit(1);
  }
};

export default connectDB;