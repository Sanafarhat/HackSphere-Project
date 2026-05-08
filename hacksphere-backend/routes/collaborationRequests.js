import express from 'express';
import CollaborationRequest from '../models/CollaborationRequest.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Send collaboration request
router.post('/send-bulk', verifyToken, async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'No students selected' });
    }

    const createdRequests = [];

    for (const studentId of studentIds) {
      // Check if already requested
      const existing = await CollaborationRequest.findOne({
        ideaHolderId: req.user._id,
        studentId,
        status: 'pending',
      });

      if (!existing) {
        const request = new CollaborationRequest({
          ideaHolderId: req.user._id,
          studentId,
          message: `Join my team to build this idea`,
          status: 'pending',
        });

        await request.save();
        createdRequests.push(request);

        // TODO: Notify student
      }
    }

    res.status(201).json({
      message: 'Collaboration requests sent',
      requests: createdRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sent requests
router.get('/sent', verifyToken, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ ideaHolderId: req.user._id })
      .populate('studentId', 'name email department skills');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get received requests
router.get('/received', verifyToken, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ studentId: req.user._id })
      .populate('ideaHolderId', 'name email department skills');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to collaboration request
router.put('/respond/:requestId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const request = await CollaborationRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.studentId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      // Check if team already exists
      let team = await Team.findOne({ leader: request.ideaHolderId });

      if (!team) {
        // Create team
        team = new Team({
          name: `Team ${request.ideaHolderId}`,
          leader: request.ideaHolderId,
          members: [request.ideaHolderId, request.studentId],
        });
        await team.save();
      } else {
        // Add to existing team
        if (!team.members.includes(request.studentId)) {
          team.members.push(request.studentId);
          await team.save();
        }
      }

      // Update both users
      await User.findByIdAndUpdate(request.ideaHolderId, {
        team: team._id,
        hasTeam: true,
      });

      await User.findByIdAndUpdate(request.studentId, {
        team: team._id,
        hasTeam: true,
      });

      request.teamId = team._id;
      await request.save();
    }

    res.json({
      message: `Request ${status}`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
