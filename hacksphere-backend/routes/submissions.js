import express from 'express';
import { verifyToken } from '../middleware/auth.js';
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

// Submit final project (only team leader)
router.post('/submit', verifyToken, async (req, res) => {
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

    let submission = await Submission.findOne({ team: team._id });
    if (!submission) {
      submission = new Submission({ title, description, githubUrl, demoUrl, team: team._id, submittedBy: req.user._id });
    } else {
      submission.title = title;
      submission.description = description;
      submission.githubUrl = githubUrl;
      submission.demoUrl = demoUrl;
      submission.submittedAt = new Date();
      submission.status = 'submitted';
      submission.submittedBy = req.user._id;
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
    const submission = await Submission.findOne({ team: user.team });
    res.json(submission || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
