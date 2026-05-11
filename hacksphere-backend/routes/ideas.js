import express from 'express';
import Idea from '../models/Idea.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { Groq } from 'groq-sdk';

const router = express.Router();

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

// Validate idea with AI
router.post('/validate', verifyToken, async (req, res) => {
  try {
    const { title, description, problemStatement, techStack, targetUsers } = req.body;
    const groq = getGroqClient();

    if (!groq) {
      return res.status(503).json({ message: 'AI validation is unavailable because GROQ_API_KEY is not set.' });
    }

    const user = await User.findById(req.user._id);
    if (!user?.team) {
      return res.status(403).json({ message: 'Only the team leader can validate this idea' });
    }

    const team = await Team.findById(user.team);
    if (!team || team.leader.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Only the team leader can validate this idea' });
    }

    // Create prompt for Groq
    const prompt = `You are an experienced hackathon judge and technical reviewer. Evaluate the idea honestly and directly without sugarcoating. Identify major strengths, weaknesses, risks, and practical concerns.

Respond in clear, professional language and provide realistic, actionable guidance. Do not use vague praise or softening words. Be precise, candid, and grounded in real hackathon constraints.

Return the response only in valid JSON format with this structure:
{
  "score": number,
  "feasibilityScore": number,
  "originalityScore": number,
  "impactScore": number,
  "scopeScore": number,
  "feedback": "string",
  "suggestions": ["string", "string", "string"]
}

Project Idea:
Title: ${title}
Description: ${description}
Problem Statement: ${problemStatement}
Tech Stack: ${techStack}
Target Users: ${targetUsers}
`;

    const message = await groq.chat.completions.create({
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  max_tokens: 1000,
  messages: [
    {
      role: 'user',
      content: prompt,
    },
  ],
});

let responseText = message.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const validationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Create idea record
    const idea = new Idea({
      title,
      description,
      problemStatement,
      techStack,
      targetUsers,
      submittedBy: req.user._id,
      validationScore: validationData.score || 0,
      feasibilityScore: validationData.feasibilityScore || 0,
      originalityScore: validationData.originalityScore || 0,
      impactScore: validationData.impactScore || 0,
      scopeScore: validationData.scopeScore || 0,
      feedback: validationData.feedback || 'No feedback provided',
      suggestions: validationData.suggestions || [],
      isValidated: true,
    });

    await idea.save();

    res.json({
      _id: idea._id,
      score: validationData.score || 0,
      feasibilityScore: validationData.feasibilityScore || 0,
      originalityScore: validationData.originalityScore || 0,
      impactScore: validationData.impactScore || 0,
      scopeScore: validationData.scopeScore || 0,
      feedback: validationData.feedback || 'No feedback provided',
      suggestions: validationData.suggestions || [],
      title,
      description,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Validation failed: ' + error.message });
  }
});

// Revalidate idea: remove previous idea and allow a fresh validation
router.post('/revalidate', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.team) {
      return res.status(400).json({ message: 'You must belong to a team to revalidate' });
    }

    const team = await Team.findById(user.team);
    if (!team || team.leader.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Only the team leader can revalidate the idea' });
    }

    if (team.idea) {
      await Idea.findByIdAndDelete(team.idea);
      team.idea = undefined;
      await team.save();
    }

    res.json({ message: 'Previous idea removed. You may now validate a new idea.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit idea (finalize)
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { title, description, problemStatement, techStack, targetUsers, validationScore } = req.body;

    // Check if user has a team
    const user = await User.findById(req.user._id);
    if (!user.team) {
      return res.status(400).json({ message: 'You must be in a team to submit an idea' });
    }

    // Find existing team idea if it exists
    let idea = await Idea.findOne({ submittedBy: req.user._id });
    const teamIdea = await Idea.findOne({ team: user.team });

    if (!idea && teamIdea) {
      idea = teamIdea;
    }

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
        isApproved: validationScore >= 75, // Auto-approve if score >= 75
      });
      await idea.save();
    } else {
      idea.title = title;
      idea.description = description;
      idea.problemStatement = problemStatement;
      idea.techStack = techStack;
      idea.targetUsers = targetUsers;
      idea.validationScore = validationScore;
      idea.isValidated = true;
      idea.isApproved = validationScore >= 75;
      await idea.save();
    }

    // Update team with idea
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
    const user = await User.findById(req.user._id);
    let idea = await Idea.findOne({ submittedBy: req.user._id });

    if (!idea && user?.team) {
      idea = await Idea.findOne({ team: user.team });
    }

    if (!idea) {
      return res.status(404).json({ message: 'No idea found' });
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
