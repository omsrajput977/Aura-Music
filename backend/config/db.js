const mongoose = require('mongoose');

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
