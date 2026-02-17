const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'No token provided' } });
  }

  try {
    req.user = jwt.verify(header.split(' ')[1], SECRET);
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
}

module.exports = auth;
