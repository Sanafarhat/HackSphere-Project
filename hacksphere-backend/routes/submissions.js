import express from 'express';
import Event from '../models/Event.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { requireEventPhase } from '../middleware/eventPhase.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Progress from '../models/Progress.js';

const router = express.Router();

const calculatePercentage = (p) => {
  const weights = {
    ideaValidated: 30,
    repoCreated: 20,
    prototypeStarted: 20,
    midCheckpoint: 15,
    finalSubmission: 15,
  };
  let percent = 0;
  for (const k of Object.keys(weights)) {
    if (p[k]) percent += weights[k];
  }
  return Math.min(100, Math.round(percent));
};

const getActiveEventId = async () => {
  const activeEvent = await Event.findOne({ isActive: true }).select('_id');
  return activeEvent?._id || null;
};

// Submit final project (only team leader)
router.post('/submit', verifyToken, requireEventPhase(['hacking'], { bypassRoles: ['platformAdmin'] }), async (req, res) => {
  try {
    const { title, description, githubUrl, demoUrl } = req.body;
    if (!title || !description || !githubUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.team) return res.status(400).json({ message: 'You must be part of a team' });

    const team = await Team.findById(user.team);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can submit the final project' });
    }

    // Basic URL validation
    if (!/^https?:\/\//i.test(githubUrl)) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }

    const activeEventId = team.event || user.event || (await getActiveEventId());

    let submission = await Submission.findOne({ team: team._id });
    if (!submission) {
      submission = new Submission({ title, description, githubUrl, demoUrl, team: team._id, submittedBy: req.user._id, event: activeEventId });
    } else {
      submission.title = title;
      submission.description = description;
      submission.githubUrl = githubUrl;
      submission.demoUrl = demoUrl;
      submission.submittedAt = new Date();
      submission.status = 'submitted';
      submission.submittedBy = req.user._id;
      if (!submission.event && activeEventId) {
        submission.event = activeEventId;
      }
    }

    await submission.save();

    // Mark finalSubmission in progress
    let progress = await Progress.findOne({ team: team._id });
    if (!progress) {
      progress = new Progress({ team: team._id });
    }
    progress.finalSubmission = true;
    progress.percentage = calculatePercentage(progress);
    await progress.save();

    res.json({ submission, progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get my team's submission
router.get('/my', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.team) return res.status(200).json(null);
    const submission = await Submission.findOne({ team: user.team, ...(user.event ? { event: user.event } : {}) });
    res.json(submission || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get public gallery submissions (accepted projects)
router.get('/gallery/public', async (req, res) => {
  try {
    const activeEventId = await getActiveEventId();
    const submissions = await Submission.find({ status: 'accepted', ...(activeEventId ? { event: activeEventId } : {}) })
      .populate('team', 'name description')
      .populate('submittedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(12);

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions (admin)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('team', 'name')
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update submission status (admin)
router.patch('/admin/:submissionId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'submitted', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
