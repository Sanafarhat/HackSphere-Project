import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

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
