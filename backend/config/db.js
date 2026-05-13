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
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;