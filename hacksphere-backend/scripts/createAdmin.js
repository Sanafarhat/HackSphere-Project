import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@hacksphere.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
const adminName = process.env.ADMIN_NAME || 'Admin User';

async function run() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = new User({ name: adminName, email: adminEmail, password: adminPassword, role: 'admin' });
    await admin.save();
    console.log('Admin created:', adminEmail);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

run();
