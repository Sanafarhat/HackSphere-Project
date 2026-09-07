import jwt from 'jsonwebtoken';

export const normalizeRole = (role) => {
  if (role === 'admin') {
    return 'platformAdmin';
  }

  if (role === 'mentor') {
    return 'organizer';
  }

  return role || 'student';
};

export const verifyToken = (req, res, next) => {
  // Prefer httpOnly cookie token, fall back to Authorization header
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.split(' ')[1];
  const token = cookieToken || headerToken;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...decoded, role: normalizeRole(decoded.role) };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requirePlatformAdmin = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== 'platformAdmin') {
    return res.status(403).json({ message: 'Platform admin access required' });
  }
  next();
};

export const requireOrganizer = (req, res, next) => {
  const role = normalizeRole(req.user?.role);

  if (role !== 'organizer' && role !== 'platformAdmin') {
    return res.status(403).json({ message: 'Organizer access required' });
  }
  next();
};

export const requireAdmin = requirePlatformAdmin;
export const requireMentor = requireOrganizer;
