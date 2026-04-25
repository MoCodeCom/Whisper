const { verifyAccess } = require('../utils/jwt');

const cpAuth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    const p = verifyAccess(h.slice(7));
    if (!['admin', 'superadmin'].includes(p.role)) return res.status(403).json({ error: 'Admin access required' });
    req.user = p;
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

module.exports = cpAuth;
