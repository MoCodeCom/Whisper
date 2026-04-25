const { verifyAccess } = require('../utils/jwt');

const auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try { req.user = verifyAccess(h.slice(7)); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

module.exports = auth;
