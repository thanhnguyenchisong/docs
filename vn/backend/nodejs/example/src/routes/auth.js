const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validate');
const { users, getNextId } = require('../store');

const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// POST /api/auth/register
router.post('/register',
  validate({
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string', minLength: 6 },
  }),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, error: { message: 'Email already exists' } });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = { id: getNextId(), name, email, password: hash, role: 'user' };
      users.push(user);

      res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email } });
    } catch (err) { next(err); }
  }
);

// POST /api/auth/login
router.post('/login',
  validate({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = users.find(u => u.email === email);
      if (!user) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
      res.json({ success: true, data: { token } });
    } catch (err) { next(err); }
  }
);

module.exports = router;
