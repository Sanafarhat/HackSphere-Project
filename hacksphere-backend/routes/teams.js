import express from 'express';
import crypto from 'crypto';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendTeamInviteEmail } from '../utils/sendEmail.js';

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
      const pendingInvites = [];
      const emailErrors = [];

      for (const email of memberEmails) {
        const inviteToken = crypto.randomBytes(32).toString('hex');

        pendingInvites.push({
          email,
          status: 'pending',
          token: inviteToken,
          sentAt: new Date(),
        });

        // Send invite email
        try {
          await sendTeamInviteEmail({
            toEmail: email,
            teamName: team.name,
            teamLeaderName: req.user.name,
            inviteToken,
          });
          console.log(`✅ Invite sent to ${email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send invite to ${email}:`, emailError.message);
          emailErrors.push(email);
        }
      }

      team.pendingInvites = pendingInvites;
      await team.save();

      return res.status(201).json({
        message: 'Team created successfully',
        team,
        invitesSent: memberEmails.length - emailErrors.length,
        invitesFailed: emailErrors.length > 0 ? emailErrors : undefined,
      });
    }

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Accept invite via token (called when teammate clicks the link)
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Find team with this invite token
    const team = await Team.findOne({
      'pendingInvites.token': token,
      'pendingInvites.status': 'pending',
    });

    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    // Find the invite
    const invite = team.pendingInvites.find(
      (inv) => inv.token === token && inv.status === 'pending'
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found or already used' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: invite.email });

    if (user) {
      // User exists — just add to team
      if (user.hasTeam) {
        return res.status(400).json({ message: 'You are already in a team' });
      }
    } else {
      // Create new user account
      if (!name || !password) {
        return res.status(400).json({ message: 'Name and password are required to set up your account' });
      }

      user = new User({
        name,
        email: invite.email,
        password,
        role: 'student',
        team: team._id,
        hasTeam: true,
      });

      await user.save();
    }

    // Add user to team members
    if (!team.members.includes(user._id)) {
      team.members.push(user._id);
    }

    // Update invite status to accepted
    invite.status = 'accepted';
    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(user._id, {
      team: team._id,
      hasTeam: true,
    });

    // Generate JWT token for auto-login
    const jwt = await import('jsonwebtoken');
    const authToken = jwt.default.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Successfully joined the team!',
      token: authToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      team: {
        _id: team._id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify invite token (called when teammate lands on /join page)
router.get('/verify-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const team = await Team.findOne({
      'pendingInvites.token': token,
      'pendingInvites.status': 'pending',
    }).populate('leader', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    const invite = team.pendingInvites.find(
      (inv) => inv.token === token && inv.status === 'pending'
    );

    res.json({
      valid: true,
      email: invite.email,
      teamName: team.name,
      leaderName: team.leader?.name,
      memberCount: team.members.length,
      maxMembers: team.maxMembers,
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