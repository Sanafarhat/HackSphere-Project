import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create team
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, requiredSkills, techStack, openToMembers, maxMembers, memberEmails } = req.body;

    // Create team
    const team = new Team({
      name,
      description,
      leader: req.user._id,
      members: [req.user._id],
      requiredSkills,
      techStack,
      openToMembers: openToMembers || false,
      maxMembers: maxMembers || 4,
    });

    await team.save();

    // Update team leader
    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      hasTeam: true,
    });

    // Send invite emails to members if provided
    if (memberEmails && memberEmails.length > 0) {
      // TODO: Send email invites via Nodemailer
    }

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get open teams (for PATH 2 - No team, No idea)
router.get('/open', verifyToken, async (req, res) => {
  try {
    const { filter } = req.query;
    let query = { openToMembers: true };

    if (filter) {
      query.$or = [
        { name: { $regex: filter, $options: 'i' } },
        { description: { $regex: filter, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(filter, 'i')] } },
        { techStack: { $regex: filter, $options: 'i' } },
      ];
    }

    const teams = await Team.find(query)
      .populate('members', 'name email')
      .populate('leader', 'name email');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my team
router.get('/my-team', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('team');
    const team = user.team;

    if (!team) {
      return res.status(404).json({ message: 'No team found' });
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'name email department year skills')
      .populate('leader', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team by ID
router.get('/:teamId', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('members', 'name email department year')
      .populate('leader', 'name email')
      .populate('idea');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
