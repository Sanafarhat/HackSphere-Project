import Event from '../models/Event.js';

const normalizePhases = (phases) => (Array.isArray(phases) ? phases : [phases]).filter(Boolean);

export const getActiveEvent = async () => {
  const activeEvent = await Event.findOne({ isActive: true }).sort({ updatedAt: -1 });

  if (!activeEvent) {
    return null;
  }

  const eventObject = activeEvent.toObject({ virtuals: true });
  eventObject.currentPhase = activeEvent.getCurrentPhase();

  return eventObject;
};

export const requireEventPhase = (allowedPhases, options = {}) => {
  const phaseList = normalizePhases(allowedPhases);
  const bypassRoles = normalizePhases(options.bypassRoles);

  return async (req, res, next) => {
    try {
      const activeEvent = await Event.findOne({ isActive: true }).sort({ updatedAt: -1 });

      if (!activeEvent) {
        return res.status(503).json({ message: 'No active hackathon event is configured' });
      }

      const currentPhase = activeEvent.getCurrentPhase();
      req.activeEvent = activeEvent;
      req.eventPhase = currentPhase;

      if (req.user?.role && bypassRoles.includes(req.user.role)) {
        return next();
      }

      if (!phaseList.includes(currentPhase)) {
        return res.status(403).json({
          message: `This action is only available during: ${phaseList.join(', ')}`,
          currentPhase,
          allowedPhases: phaseList,
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};

export const withActiveEvent = async (req, res, next) => {
  try {
    req.activeEvent = await getActiveEvent();
    req.eventPhase = req.activeEvent?.currentPhase || 'inactive';
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};