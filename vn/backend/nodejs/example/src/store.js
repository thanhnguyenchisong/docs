/**
 * In-memory store (thay cho database).
 * Trong production sẽ dùng MongoDB/PostgreSQL.
 */
const bcrypt = require('bcrypt');

const users = [];
let nextId = 1;

async function seedAdmin() {
  if (users.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    users.push({ id: nextId++, name: 'Admin', email: 'admin@example.com', password: hash, role: 'admin' });
  }
}
seedAdmin();

module.exports = {
  users,
  getNextId: () => nextId++,
};
