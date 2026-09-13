const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to prevent SRV ESERVFAIL errors on macOS/Wi-Fi
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('⚠️  MONGODB_URI is not set in backend/.env.');
    console.log('👉 Please add your MongoDB connection string in backend/.env to persist user accounts.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✨ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
