import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
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

// Get unmatched students
router.get('/unmatched', verifyToken, async (req, res) => {
  try {
    const { filter } = req.query;

    let query = {
      role: 'student',
      hasTeam: false,
      _id: { $ne: req.user._id }, // Exclude current user
    };

    if (filter) {
      query.$or = [
        { name: { $regex: filter, $options: 'i' } },
        { skills: { $in: [new RegExp(filter, 'i')] } },
        { department: { $regex: filter, $options: 'i' } },
      ];
    }

    const students = await User.find(query).select('-password');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended students (AI-powered)
router.get('/recommended', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all unmatched students with openToNewMembers or solo
    const unmatched = await User.find({
      role: 'student',
      _id: { $ne: req.user._id },
      hasTeam: false,
    }).select('-password');

    if (unmatched.length === 0) {
      return res.json([]);
    }

    const groq = getGroqClient();
    if (!groq) {
      // Fallback: return random students without AI scoring
      return res.json(
        unmatched.slice(0, 9).map(student => ({
          ...student.toObject(),
          matchScore: 50,
        }))
      );
    }

    // Use AI to score matches
    const prompt = `You are an expert at matching collaborators for hackathon teams. Based on the user's skills and the list of available students, score how well each student matches with the user.

User's Skills: ${user.skills?.join(', ') || 'Not specified'}
User's Department: ${user.department || 'Not specified'}
User's Year: ${user.year || 'Not specified'}

Available Students:
${unmatched.map((s, i) => `${i + 1}. ${s.name} - Skills: ${s.skills?.join(', ')}, Department: ${s.department}, Year: ${s.year}`).join('\n')}

Respond in JSON format with an array of matches:
[
  { "index": 1, "matchScore": 85 },
  { "index": 2, "matchScore": 72 },
  ...
]

Match score factors: skill complementarity (40%), department relevance (20%), year similarity (15%), availability (15%), communication style (10%).
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
      scores = unmatched.map((_, i) => ({ index: i + 1, matchScore: 50 }));
    }

    // Map scores to students and sort
    const scored = unmatched.map((student, i) => {
      const score = scores.find(s => s.index === i + 1);
      return {
        ...student.toObject(),
        matchScore: score?.matchScore || 50,
      };
    });

    // Sort by match score descending and return top 9
    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored.slice(0, 9));
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:studentId', verifyToken, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
