import express from 'express';
import crypto from 'crypto';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendTeamInviteEmail } from '../utils/SendEmail.js';

const router = express.Router();

// Create team
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, requiredSkills, techStack, openToMembers, maxMembers, memberEmails } = req.body;

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

    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      hasTeam: true,
    });

    const leader = await User.findById(req.user._id).select('name');

    if (memberEmails && memberEmails.length > 0) {
      const pendingInvites = [];

      for (const email of memberEmails) {
        const inviteToken = crypto.randomBytes(32).toString('hex');
        pendingInvites.push({
          email,
          status: 'pending',
          token: inviteToken,
          sentAt: new Date(),
        });

        // ✅ Fire and forget — respond fast, send in background
        sendTeamInviteEmail({
          toEmail: email,
          teamName: team.name,
          teamLeaderName: leader.name,
          inviteToken,
        }).then(() => {
          console.log(`✅ Invite sent to ${email}`);
        }).catch((err) => {
          console.error(`❌ Failed to send invite to ${email}:`, err.message);
        });
      }

      team.pendingInvites = pendingInvites;
      await team.save();
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

// Accept invite via token
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const team = await Team.findOne({
      'pendingInvites.token': token,
      'pendingInvites.status': 'pending',
    });

    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    const invite = team.pendingInvites.find(
      (inv) => inv.token === token && inv.status === 'pending'
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found or already used' });
    }

    let user = await User.findOne({ email: invite.email });

    if (user) {
      if (user.hasTeam) {
        return res.status(400).json({ message: 'You are already in a team' });
      }
    } else {
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

    if (!team.members.includes(user._id)) {
      team.members.push(user._id);
    }

    invite.status = 'accepted';
    await team.save();

    await User.findByIdAndUpdate(user._id, {
      team: team._id,
      hasTeam: true,
    });

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

// Verify invite token
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

// ✅ resend-invite MUST be before /:teamId
router.post('/resend-invite', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      return res.status(404).json({ message: 'Team not found or you are not the leader' });
    }

    const invite = team.pendingInvites.find(
      (inv) => inv.email === email && inv.status === 'pending'
    );

    if (!invite) {
      return res.status(404).json({ message: 'No pending invite found for this email' });
    }

    // Generate fresh token
    const newToken = crypto.randomBytes(32).toString('hex');
    invite.token = newToken;
    invite.sentAt = new Date();
    await team.save();

    const leader = await User.findById(req.user._id).select('name');

    // ✅ Respond immediately — no timeout
    res.json({ message: `Invite resent to ${email}` });

    // ✅ Send email in background
    sendTeamInviteEmail({
      toEmail: email,
      teamName: team.name,
      teamLeaderName: leader.name,
      inviteToken: newToken,
    }).then(() => {
      console.log(`✅ Resent invite to ${email}`);
    }).catch((err) => {
      console.error(`❌ Failed to resend invite to ${email}:`, err.message);
    });

  } catch (error) {
    console.error('Resend invite error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get open teams (PATH 2 - No team, No idea)
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

// ✅ /:teamId is always LAST to avoid catching other routes
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