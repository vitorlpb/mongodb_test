import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    mongoose.set('debug', true); // Enable mongoose debug mode
    const conn = await mongoose.connect(process.env.MONGO_URI, {

    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;