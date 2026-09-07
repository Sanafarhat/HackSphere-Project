import express from 'express';
import Event from '../models/Event.js';
import { verifyToken, requirePlatformAdmin, requireOrganizer } from '../middleware/auth.js';
import { getActiveEvent } from '../middleware/eventPhase.js';

const router = express.Router();

const pickEventFields = (event) => ({
  _id: event._id,
  title: event.title,
  description: event.description,
  logoUrl: event.logoUrl,
  primaryColor: event.primaryColor,
  secondaryColor: event.secondaryColor,
  registrationStart: event.registrationStart,
  hackingStart: event.hackingStart,
  submissionDeadline: event.submissionDeadline,
  judgingStart: event.judgingStart,
  judgingEnd: event.judgingEnd,
  isActive: event.isActive,
  organizers: event.organizers,
  createdBy: event.createdBy,
  currentPhase: event.getCurrentPhase(),
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

router.get('/active', async (req, res) => {
  try {
    const event = await Event.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!event) {
      return res.json({ event: null });
    }

    return res.json({ event: pickEventFields(event) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/', verifyToken, requirePlatformAdmin, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events.map(pickEventFields));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, requirePlatformAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      logoUrl,
      primaryColor,
      secondaryColor,
      registrationStart,
      hackingStart,
      submissionDeadline,
      judgingStart,
      judgingEnd,
      organizers = [],
      isActive = false,
    } = req.body;

    if (!title || !registrationStart || !hackingStart || !submissionDeadline) {
      return res.status(400).json({
        message: 'Title, registrationStart, hackingStart, and submissionDeadline are required',
      });
    }

    const event = await Event.create({
      title,
      description,
      logoUrl,
      primaryColor,
      secondaryColor,
      registrationStart,
      hackingStart,
      submissionDeadline,
      judgingStart,
      judgingEnd,
      organizers,
      createdBy: req.user._id,
      isActive,
    });

    res.status(201).json({ event: pickEventFields(event) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:eventId', verifyToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      title,
      description,
      logoUrl,
      primaryColor,
      secondaryColor,
      registrationStart,
      hackingStart,
      submissionDeadline,
      judgingStart,
      judgingEnd,
      isActive,
      organizers,
    } = req.body;

    if (req.user.role === 'organizer' && !event.organizers.some((organizerId) => organizerId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Organizer access is limited to your assigned event' });
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (logoUrl !== undefined) event.logoUrl = logoUrl;
    if (primaryColor !== undefined) event.primaryColor = primaryColor;
    if (secondaryColor !== undefined) event.secondaryColor = secondaryColor;
    if (registrationStart !== undefined) event.registrationStart = registrationStart;
    if (hackingStart !== undefined) event.hackingStart = hackingStart;
    if (submissionDeadline !== undefined) event.submissionDeadline = submissionDeadline;
    if (judgingStart !== undefined) event.judgingStart = judgingStart;
    if (judgingEnd !== undefined) event.judgingEnd = judgingEnd;
    if (Array.isArray(organizers)) event.organizers = organizers;
    if (typeof isActive === 'boolean') event.isActive = isActive;

    await event.save();

    res.json({ event: pickEventFields(event) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:eventId/activate', verifyToken, requirePlatformAdmin, async (req, res) => {
  try {
    const targetEvent = await Event.findById(req.params.eventId);

    if (!targetEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.updateMany({ _id: { $ne: targetEvent._id } }, { $set: { isActive: false } });
    targetEvent.isActive = true;
    await targetEvent.save();

    res.json({ event: pickEventFields(targetEvent) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/current-phase', async (req, res) => {
  try {
    const event = await getActiveEvent();
    res.json({
      event,
      currentPhase: event?.currentPhase || 'inactive',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;