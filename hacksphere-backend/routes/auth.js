import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { verifyToken, requirePlatformAdmin } from '../middleware/auth.js';

const router = express.Router();

const getActiveEventId = async () => {
  const activeEvent = await Event.findOne({ isActive: true }).select('_id');
  return activeEvent?._id || null;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', department, year, skills } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const activeEventId = await getActiveEventId();

    // Public registration stays student-only. Organizer/platform admin accounts are created by platform admins.
    const normalizedRole = role === 'student' ? 'student' : 'student';

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: normalizedRole,
      department,
      year,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      event: activeEventId,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for auth (prevents XSS token theft)
    // For cross-site requests from the deployed frontend we need SameSite=None and Secure in production
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for auth (prevents XSS token theft)
    // Use SameSite=None in production so the cookie will be sent with cross-site XHR/fetch from the Vercel frontend
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Platform admin creates organizer/platform admin accounts
router.post('/admin/users', verifyToken, requirePlatformAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'organizer', department, year, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const allowedRoles = ['student', 'organizer', 'platformAdmin'];
    const normalizedRole = allowedRoles.includes(role) ? role : 'organizer';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const activeEventId = await getActiveEventId();

    const user = new User({
      name,
      email,
      password,
      role: normalizedRole,
      department,
      year,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((skill) => skill.trim()) : [],
      event: activeEventId,
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout (clear httpOnly cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ message: 'Logged out' });
});

// Update user profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { openToNewMembers, bio, availability, skills } = req.body;
    
    const updateData = {};
    if (openToNewMembers !== undefined) updateData.openToNewMembers = openToNewMembers;
    if (bio !== undefined) updateData.bio = bio;
    if (availability !== undefined) updateData.availability = availability;
    if (skills !== undefined) updateData.skills = Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

// Seed admin (for local testing only)
router.post('/seed-admin', async (req, res) => {
  try {
    // Only allow seeding when enabled via env var
    if (process.env.ALLOW_ADMIN_SEED !== 'true') {
      return res.status(403).json({ message: 'Admin seeding is disabled' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || req.body.email;
    const adminPassword = process.env.ADMIN_PASSWORD || req.body.password;
    const adminName = process.env.ADMIN_NAME || req.body.name || 'Admin User';

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'Admin email and password must be provided' });
    }

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      return res.status(200).json({ message: 'Admin already exists', user: { email: existing.email, role: existing.role } });
    }

    const admin = new User({ name: adminName, email: adminEmail, password: adminPassword, role: 'platformAdmin' });
    await admin.save();

    res.status(201).json({ message: 'Admin user created', user: { email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
