import mongoose from 'mongoose';

const connectDB = async () => {
  console.log('TEST:', process.env.TEST ? 'configured' : 'undefined');
  console.log('MONGO:', process.env.MONGO_URI ? 'configured' : 'undefined');

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;