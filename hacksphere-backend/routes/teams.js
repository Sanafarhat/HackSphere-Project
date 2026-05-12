import express from 'express';
import Idea from '../models/Idea.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { Groq } from 'groq-sdk';
import { sendTeamInviteEmail, sendWelcomeEmail } from '../utils/SendEmail.js';

const router = express.Router();

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const INVITE_TOKEN_EXPIRES_IN = '7d';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const createInviteToken = ({ teamId, email }) =>
  jwt.sign({ teamId, email: normalizeEmail(email) }, process.env.JWT_SECRET, {
    expiresIn: INVITE_TOKEN_EXPIRES_IN,
  });

const buildTeamPayload = (team) =>
  team.populate([
    { path: 'leader', select: 'name email department year skills' },
    { path: 'members', select: 'name email department year skills' },
    { path: 'idea' },
  ]);

// Create a team and send email invites
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description = '',
      memberEmails = [],
      openToMembers = false,
      maxMembers = 5,
      requiredSkills = [],
      techStack = '',
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const leader = await User.findById(req.user._id);
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    if (leader.team) {
      return res.status(400).json({ message: 'You already belong to a team' });
    }

    const uniqueEmails = [...new Set((memberEmails || []).map(normalizeEmail).filter(Boolean))].filter(
      (email) => email !== normalizeEmail(leader.email)
    );

    // Validate team size: 4-5 members total (lead + teammates)
    const totalTeamSize = 1 + uniqueEmails.length;
    if (totalTeamSize < 4 || totalTeamSize > 5) {
      return res.status(400).json({ message: 'Team must have 4-5 members total (including team lead)' });
    }

    const pendingInvites = [];

    for (const email of uniqueEmails) {
      const existingUser = await User.findOne({ email });
      if (existingUser?.team) {
        continue;
      }

      pendingInvites.push({
        email,
        token: '',
        status: 'pending',
        sentAt: new Date(),
      });
    }

    const team = new Team({
      name: name.trim(),
      description,
      leader: leader._id,
      members: [leader._id],
      requiredSkills,
      techStack,
      openToMembers,
      maxMembers,
      pendingInvites,
    });

    await team.save();

    const inviteResults = [];

    // Prepare tokens and sentAt timestamps
    for (const invite of team.pendingInvites) {
      invite.token = createInviteToken({ teamId: team._id, email: invite.email });
      invite.sentAt = new Date();
    }

    // Send all invites in parallel to reduce total latency
    const sendPromises = team.pendingInvites.map((invite) =>
      sendTeamInviteEmail({
        toEmail: invite.email,
        teamName: team.name,
        teamLeaderName: leader.name,
        inviteToken: invite.token,
      })
        .then(() => ({ email: invite.email, sent: true }))
        .catch((emailError) => ({ email: invite.email, sent: false, error: emailError.message }))
    );

    const settled = await Promise.all(sendPromises);
    inviteResults.push(...settled);

    leader.team = team._id;
    leader.hasTeam = true;
    await leader.save();

    await team.save();

    const populatedTeam = await buildTeamPayload(await Team.findById(team._id));

    res.status(201).json({
      message: 'Team created successfully',
      team: populatedTeam,
      inviteResults,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my team
router.get('/my-team', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.team) {
      return res.status(200).json(null);
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return res.status(200).json(null);
    }

    const populatedTeam = await buildTeamPayload(team);
    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update team settings (openToMembers toggle, etc.)
router.patch('/my-team', verifyToken, async (req, res) => {
  try {
    const { openToMembers } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user?.team) {
      return res.status(400).json({ message: 'You do not have a team' });
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return res.status(400).json({ message: 'Team not found' });
    }

    // Only team lead can update settings
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team lead can update team settings' });
    }

    // Update fields
    if (typeof openToMembers === 'boolean') {
      team.openToMembers = openToMembers;
    }

    await team.save();
    const populatedTeam = await buildTeamPayload(team);
    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get open teams
router.get('/open', async (req, res) => {
  try {
    const filter = (req.query.filter || '').trim();
    const query = {
      openToMembers: true,
    };

    if (filter) {
      query.$or = [
        { name: { $regex: filter, $options: 'i' } },
        { description: { $regex: filter, $options: 'i' } },
        { techStack: { $regex: filter, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: filter, $options: 'i' } } },
      ];
    }

    const teams = await Team.find(query)
      .populate('leader', 'name email department year skills')
      .populate('members', 'name email department year skills')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended teams (AI-powered)
router.get('/recommended', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all open teams
    const openTeams = await Team.find({ openToMembers: true })
      .populate('leader', 'name email department year skills')
      .populate('members', 'name email department year skills')
      .sort({ createdAt: -1 });

    if (openTeams.length === 0) {
      return res.json([]);
    }

    const groq = getGroqClient();
    if (!groq) {
      // Fallback: return all open teams without AI scoring
      return res.json(
        openTeams.map(team => ({
          ...team.toObject(),
          matchScore: 50,
        }))
      );
    }

    // Use AI to score matches
    const prompt = `You are an expert at matching hackathon teams with students. Based on the student's skills and each team's requirements, score how well each team matches with the student.

Student's Skills: ${user.skills?.join(', ') || 'Not specified'}
Student's Department: ${user.department || 'Not specified'}
Student's Year: ${user.year || 'Not specified'}

Available Teams:
${openTeams.map((t, i) => `${i + 1}. ${t.name} - Required Skills: ${t.requiredSkills?.join(', ')}, Tech Stack: ${t.techStack}, Members: ${t.members?.length || 0}/${t.maxMembers}`).join('\n')}

Respond in JSON format with an array of matches:
[
  { "index": 1, "matchScore": 85 },
  { "index": 2, "matchScore": 72 },
  ...
]

Match score factors: skill match (40%), tech stack interest (25%), team size fit (15%), department relevance (15%), availability (5%).
Base all scores on the information provided.`;

    const message = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    let responseText = message.choices[0]?.message?.content || '[]';
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    let scores = [];
    
    try {
      scores = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
      console.error('Failed to parse AI scores:', e);
      scores = openTeams.map((_, i) => ({ index: i + 1, matchScore: 50 }));
    }

    // Map scores to teams and sort
    const scored = openTeams.map((team, i) => {
      const score = scores.find(s => s.index === i + 1);
      return {
        ...team.toObject(),
        matchScore: score?.matchScore || 50,
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored);
  } catch (error) {
    console.error('Team recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify invite token before account setup
router.get('/verify-invite/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const team = await Team.findById(decoded.teamId).populate('leader', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const invite = team.pendingInvites.find(
      (entry) => normalizeEmail(entry.email) === normalizeEmail(decoded.email) && entry.token === req.params.token
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite link is invalid or expired' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'This invite has already been handled' });
    }

    res.json({
      email: invite.email,
      teamName: team.name,
      leaderName: team.leader?.name || 'Team Lead',
      memberCount: team.members.length,
      maxMembers: team.maxMembers,
    });
  } catch (error) {
    res.status(400).json({ message: 'This invite link is invalid or has expired' });
  }
});

// Accept invite and create or attach the user
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ message: 'Token, name, and password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findById(decoded.teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const invite = team.pendingInvites.find(
      (entry) => normalizeEmail(entry.email) === normalizeEmail(decoded.email) && entry.token === token
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite link is invalid or expired' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'This invite has already been used' });
    }

    if ((team.members?.length || 0) >= team.maxMembers) {
      return res.status(400).json({ message: 'This team is already full' });
    }

    const email = normalizeEmail(invite.email);
    let user = await User.findOne({ email });

    if (user && user.team && user.team.toString() !== team._id.toString()) {
      return res.status(400).json({ message: 'This account already belongs to another team' });
    }

    if (!user) {
      user = new User({
        name: name.trim(),
        email,
        password,
        role: 'student',
      });
    } else {
      user.name = name.trim() || user.name;
    }

    user.team = team._id;
    user.hasTeam = true;
    await user.save();

    if (!team.members.some((memberId) => memberId.toString() === user._id.toString())) {
      team.members.push(user._id);
    }

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await team.save();

    try {
      await sendWelcomeEmail({
        toEmail: user.email,
        name: user.name,
        teamName: team.name,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    const tokenPayload = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie to establish session (prevents XSS token theft)
    res.cookie('token', tokenPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Invite accepted successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      teamId: team._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resend an invite email
router.post('/resend-invite', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const invite = team.pendingInvites.find(
      (entry) => normalizeEmail(entry.email) === normalizeEmail(email)
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending invites can be resent' });
    }

    invite.token = createInviteToken({ teamId: team._id, email: invite.email });
    invite.sentAt = new Date();
    await team.save();

    const leader = await User.findById(req.user._id);
    const inviteLink = `${process.env.FRONTEND_URL}/join?token=${invite.token}`;

    // Fire-and-forget: don't wait on slow SMTP calls — respond quickly and log failures
    sendTeamInviteEmail({
      toEmail: invite.email,
      teamName: team.name,
      teamLeaderName: leader?.name || 'Team Lead',
      inviteToken: invite.token,
    })
      .then(() => console.log(`Invite resent to ${invite.email}`))
      .catch((e) => console.error('Failed to resend invite:', e.message || e));

    res.json({
      message: 'Invite resent (email send queued)',
      inviteLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Note: Idea validation has been moved to routes/ideas.js to avoid duplication.
// Team-related routes should focus on team management only.

// Submit idea (finalize)
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { title, description, problemStatement, techStack, targetUsers, validationScore } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.team) {
      return res.status(400).json({ message: 'You must be in a team to submit an idea' });
    }

    let idea = await Idea.findOne({ submittedBy: req.user._id });
    if (!idea) {
      idea = new Idea({
        title,
        description,
        problemStatement,
        techStack,
        targetUsers,
        submittedBy: req.user._id,
        team: user.team,
        validationScore,
        isValidated: true,
        isApproved: validationScore >= 75,
      });
      await idea.save();
    } else {
      idea.isApproved = validationScore >= 75;
      await idea.save();
    }

    await Team.findByIdAndUpdate(user.team, { idea: idea._id });

    res.json({
      message: 'Idea submitted successfully',
      idea,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my idea
router.get('/my-idea', verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findOne({ submittedBy: req.user._id });

    // ✅ Return null instead of 404 — dashboard handles null gracefully
    if (!idea) {
      return res.status(200).json(null);
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all ideas (admin)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate('submittedBy', 'name email')
      .populate('team', 'name members');

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Override idea approval (admin)
router.put('/admin/override/:ideaId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { reason, approved } = req.body;

    const idea = await Idea.findByIdAndUpdate(
      req.params.ideaId,
      {
        isApproved: approved,
        adminOverride: {
          isOverridden: true,
          reason,
          overriddenBy: req.user._id,
        },
      },
      { new: true }
    );

    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;