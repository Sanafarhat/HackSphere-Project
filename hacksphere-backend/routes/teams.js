import express from 'express';
import Idea from '../models/Idea.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { Groq } from 'groq-sdk';

const router = express.Router();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Validate idea with AI
router.post('/validate', verifyToken, async (req, res) => {
  try {
    const { title, description, problemStatement, techStack, targetUsers } = req.body;

    const prompt = `You are an expert hackathon judge evaluating a student project idea. Analyze the following hackathon project idea and provide:
1. Overall validation score (0-100)
2. Individual scores for: Feasibility (0-100), Originality (0-100), Impact (0-100), Technical Scope (0-100)
3. Detailed feedback paragraph
4. 3-4 specific suggestions for improvement

Project Idea:
Title: ${title}
Description: ${description}
Problem Statement: ${problemStatement}
Tech Stack: ${techStack}
Target Users: ${targetUsers}

IMPORTANT: Respond in valid JSON format only with this structure:
{
  "score": number,
  "feasibilityScore": number,
  "originalityScore": number,
  "impactScore": number,
  "scopeScore": number,
  "feedback": "string",
  "suggestions": ["string", "string", "string"]
}`;

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

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const validationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

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