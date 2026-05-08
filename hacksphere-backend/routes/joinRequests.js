import express from 'express';
import JoinRequest from '../models/JoinRequest.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send join request
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { teamId, message } = req.body;

    // Check if already requested
    const existing = await JoinRequest.findOne({
      teamId,
      studentId: req.user._id,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const joinRequest = new JoinRequest({
      teamId,
      studentId: req.user._id,
      message,
      status: 'pending',
    });

    await joinRequest.save();

    // TODO: Notify team lead

    res.status(201).json({
      message: 'Join request sent successfully',
      joinRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sent requests
router.get('/sent', verifyToken, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ studentId: req.user._id })
      .populate('teamId', 'name description');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team requests (for team lead)
router.get('/team/:teamId', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team || team.leader.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const requests = await JoinRequest.find({ teamId: req.params.teamId })
      .populate('studentId', 'name email department year skills');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to join request
router.put('/respond/:requestId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const joinRequest = await JoinRequest.findById(req.params.requestId);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const team = await Team.findById(joinRequest.teamId);
    if (team.leader.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    joinRequest.status = status;
    joinRequest.respondedAt = new Date();
    joinRequest.respondedBy = req.user._id;
    await joinRequest.save();

    if (status === 'accepted') {
      // Add student to team
      team.members.push(joinRequest.studentId);
      await team.save();

      // Update student
      await User.findByIdAndUpdate(joinRequest.studentId, {
        team: team._id,
        hasTeam: true,
      });
    }

    res.json({
      message: `Request ${status}`,
      joinRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
