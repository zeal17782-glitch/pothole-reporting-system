// =============================================
// DB.JS — Database connection configuration
// =============================================

const mongoose = require('mongoose');

// This function connects to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    // Exit the process if DB connection fails
    process.exit(1);
  }
};

// Export so other files can use it
module.exports = connectDB;