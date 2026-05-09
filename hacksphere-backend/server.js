

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import ideaRoutes from './routes/ideas.js';
import joinRequestRoutes from './routes/joinRequests.js';
import collaborationRequestRoutes from './routes/collaborationRequests.js';
import studentRoutes from './routes/students.js';
import { verifyToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hack-sphere-project-chi.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/collaboration-requests', collaborationRequestRoutes);
app.use('/api/students', studentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'HackSphere server is running' });
});

app.get('/api/progress/my-progress', verifyToken, (req, res) => {
  res.json({ percentage: 0, ideaValidated: false, repoCreated: false, prototypeStarted: false, midCheckpoint: false, finalSubmission: false });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ HackSphere server running on http://localhost:${PORT}`);
  console.log(`📊 Database: MongoDB connected`);
  console.log(`🤖 AI Engine: Groq Llama 3.3 70B ready`);
});
