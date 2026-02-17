const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth', () => {
  test('POST /api/auth/register creates user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'pass1234' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('POST /api/auth/register rejects invalid email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'bad', password: 'pass1234' })
      .expect(400);
  });

  test('POST /api/auth/login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' })
      .expect(200);
    expect(res.body.data).toHaveProperty('token');
  });

  test('POST /api/auth/login rejects wrong password', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong' })
      .expect(401);
  });
});

describe('Users', () => {
  test('GET /api/users returns list', async () => {
    const res = await request(app).get('/api/users').expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });

  test('GET /api/users/:id returns user without password', async () => {
    const res = await request(app).get('/api/users/1').expect(200);
    expect(res.body.data.name).toBe('Admin');
    expect(res.body.data.password).toBeUndefined();
  });

  test('GET /api/users/999 returns 404', async () => {
    await request(app).get('/api/users/999').expect(404);
  });

  test('GET /api/users/me/profile requires auth', async () => {
    await request(app).get('/api/users/me/profile').expect(401);
  });

  test('GET /api/users/me/profile with token returns profile', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data.email).toBe('admin@example.com');
  });
});

describe('404', () => {
  test('Unknown route returns 404', async () => {
    await request(app).get('/api/nonexistent').expect(404);
  });
});
