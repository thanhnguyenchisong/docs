const { Router } = require('express');
const auth = require('../middleware/auth');
const { users } = require('../store');

const router = Router();

// GET /api/users — list (public, có pagination)
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const start = (page - 1) * limit;

  const data = users
    .map(({ password, ...u }) => u) // loại bỏ password
    .slice(start, start + limit);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total: users.length },
  });
});

// GET /api/users/:id — get by id (public)
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  const { password, ...data } = user;
  res.json({ success: true, data });
});

// GET /api/users/me/profile — profile (protected)
router.get('/me/profile', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  const { password, ...data } = user;
  res.json({ success: true, data });
});

// DELETE /api/users/:id — delete (protected, admin only)
router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  }
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  users.splice(index, 1);
  res.status(204).end();
});

module.exports = router;
