const mongoose = require("mongoose");
require("dotenv").config(); // If using .env file
const startScheduler = require("../utils/scheduler");

// MongoDB connection

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Prevent long connection hangs
    });
    startScheduler(); // Start the scheduler after DB connection
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;
