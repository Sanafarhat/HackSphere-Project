import express from 'express';
import Notification from '../models/Notification.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user's notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const { isRead } = req.query;
    let query = { recipient: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread notification count
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read/all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:notificationId', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create system announcement (admin)
router.post('/admin/announcement', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, message, priority = 'medium' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Get all users to send announcement
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ role: 'student' }).select('_id');

    if (users.length === 0) {
      return res.status(400).json({ message: 'No users to send announcement to' });
    }

    // Create notifications for all users
    const notifications = users.map((user) => ({
      recipient: user._id,
      type: 'announcement',
      title,
      message,
      priority,
    }));

    await Notification.insertMany(notifications);

    res.json({
      message: `Announcement sent to ${notifications.length} users`,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
