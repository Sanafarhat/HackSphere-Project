

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import ideaRoutes from './routes/ideas.js';
import joinRequestRoutes from './routes/joinRequests.js';
import collaborationRequestRoutes from './routes/collaborationRequests.js';
import studentRoutes from './routes/students.js';
import submissionRoutes from './routes/submissions.js';
import eventRoutes from './routes/events.js';
import notificationRoutes from './routes/notifications.js';
import { verifyToken } from './middleware/auth.js';
import { requireEventPhase, withActiveEvent } from './middleware/eventPhase.js';
import Progress from './models/Progress.js';
import Team from './models/Team.js';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

// Initialize Express app
const app = express();

// Middleware
// CORS: allow explicit frontends and support requests without an Origin (curl, server-to-server)
const allowedOrigins = [
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:5174']
    : []),
  'https://hack-sphere-project-chi.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  // Helpful debug log for CORS troubleshooting in deployment logs
  const origin = req.headers.origin;
  if (!origin) {
    console.log('Incoming Origin: undefined — possible reasons: same-origin request, curl/health-check, or no Origin header sent. Request info:', {
      path: req.path,
      method: req.method,
      host: req.headers.host,
      referer: req.headers.referer,
      ip: req.ip,
    });
  } else {
    console.log('Incoming Origin:', origin);
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Not allowed — callback with null and false so CORS middleware doesn't set the header
      return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
  })
);

// Security hardening
app.use(helmet());

// Rate limiting: basic global limits to mitigate brute force and abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse cookies (for httpOnly JWT cookie)
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize user input to prevent NoSQL injection and XSS
app.use(mongoSanitize());
app.use(xss());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/collaboration-requests', collaborationRequestRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'HackSphere server is running' });
});

// Calculate progress percentage using milestone weights
const calculatePercentage = (p) => {
  // weights (sum to 100)
  const weights = {
    ideaValidated: 30,
    repoCreated: 20,
    prototypeStarted: 20,
    midCheckpoint: 15,
    finalSubmission: 15,
  };
  let percent = 0;
  for (const key of Object.keys(weights)) {
    if (p[key]) percent += weights[key];
  }
  return Math.min(100, Math.round(percent));
};

// Get current user's team progress
app.get('/api/progress/my-progress', verifyToken, withActiveEvent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.team) return res.status(200).json(null);

    const team = await Team.findById(user.team).populate('idea');
    if (req.activeEvent && team?.event && team.event.toString() !== req.activeEvent._id.toString()) {
      return res.status(200).json(null);
    }

    // Try to find a progress document
    let progress = await Progress.findOne({ team: team._id, ...(req.activeEvent ? { event: req.activeEvent._id } : {}) });

    // If no progress doc exists, synthesize from available data
    if (!progress) {
      const synth = {
        team: team._id,
        event: req.activeEvent?._id,
        ideaValidated: Boolean(team.idea && team.idea.isValidated),
        repoCreated: false,
        prototypeStarted: false,
        midCheckpoint: false,
        finalSubmission: false,
        percentage: 0,
        deadlines: {},
      };
      synth.percentage = calculatePercentage(synth);
      return res.json(synth);
    }

    // If progress has explicit percentage, use it; otherwise compute
    const data = {
      team: progress.team,
      ideaValidated: progress.ideaValidated || Boolean(team?.idea?.isValidated),
      repoCreated: progress.repoCreated,
      prototypeStarted: progress.prototypeStarted,
      midCheckpoint: progress.midCheckpoint,
      finalSubmission: progress.finalSubmission,
      deadlines: progress.deadlines || {},
    };
    data.percentage = progress.percentage && progress.percentage > 0 ? progress.percentage : calculatePercentage(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Alerts: return simple alerts for missing milestones and upcoming deadlines
app.get('/api/progress/alerts', verifyToken, withActiveEvent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.team) return res.status(200).json([]);
    const progress = await Progress.findOne({ team: user.team, ...(req.activeEvent ? { event: req.activeEvent._id } : {}) });
    const team = await Team.findById(user.team).populate('leader', 'name');

    if (req.activeEvent && team?.event && team.event.toString() !== req.activeEvent._id.toString()) {
      return res.status(200).json({ team: null, alerts: [] });
    }

    const alerts = [];
    const now = new Date();

    const p = progress || {};

    if (!p.ideaValidated && (!p.deadlines || !p.deadlines.ideaValidationBy || new Date(p.deadlines.ideaValidationBy) > now)) {
      alerts.push({ type: 'milestone', message: 'Idea not validated yet. Validate before the deadline.', priority: 'high' });
    }

    if (p.deadlines && p.deadlines.finalSubmissionBy) {
      const daysLeft = Math.ceil((new Date(p.deadlines.finalSubmissionBy) - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft >= 0) {
        alerts.push({ type: 'deadline', message: `Final submission due in ${daysLeft} day(s).`, priority: 'high', daysLeft });
      } else if (daysLeft < 0) {
        alerts.push({ type: 'deadline', message: `Final submission overdue by ${Math.abs(daysLeft)} day(s).`, priority: 'critical', daysLeft });
      }
    }

    // Generic reminders
    if (!p.repoCreated) alerts.push({ type: 'reminder', message: 'Create your project repository.', priority: 'medium' });
    if (!p.prototypeStarted) alerts.push({ type: 'reminder', message: 'Start working on a prototype.', priority: 'medium' });

    res.json({ team: { id: team._id, name: team.name, leader: team.leader?.name }, alerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Leaderboard: teams sorted by progress percentage desc
app.get('/api/progress/leaderboard', withActiveEvent, async (req, res) => {
  try {
    // get all progress docs, compute percentage if missing, join team and leader
    const progresses = await Progress.find(req.activeEvent ? { event: req.activeEvent._id } : {}).lean();
    const rows = [];
    for (const p of progresses) {
      const team = await Team.findById(p.team).populate('leader', 'name');
      if (!team) continue;
      const percent = p.percentage && p.percentage > 0 ? p.percentage : calculatePercentage(p);
      rows.push({ teamId: team._id, teamName: team.name, leader: team.leader?.name, percentage: percent, members: team.members?.length || 0 });
    }
    rows.sort((a, b) => b.percentage - a.percentage);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update progress (only team lead can update their team's milestones)
app.patch('/api/progress/update', verifyToken, requireEventPhase(['hacking', 'judging'], { bypassRoles: ['platformAdmin'] }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.team) return res.status(400).json({ message: 'You are not part of a team' });

    const team = await Team.findById(user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Only leader may update
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can update progress' });
    }

    // Allowed fields to update
    const allowed = ['ideaValidated', 'repoCreated', 'prototypeStarted', 'midCheckpoint', 'finalSubmission', 'deadlines'];
    let progress = await Progress.findOne({ team: team._id, ...(req.activeEvent ? { event: req.activeEvent._id } : {}) });
    if (!progress) {
      progress = new Progress({ team: team._id, event: req.activeEvent?._id });
    }

    for (const key of Object.keys(req.body || {})) {
      if (!allowed.includes(key)) continue;
      progress[key] = req.body[key];
    }

    // Recompute percentage unless explicitly provided
    progress.percentage = calculatePercentage(progress);
    await progress.save();

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
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
