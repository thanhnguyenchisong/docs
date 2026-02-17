# Testing

## Mục lục
1. [Tại sao cần Test?](#tại-sao-cần-test)
2. [Test Pyramid](#test-pyramid)
3. [Jest — Setup & Cơ bản](#jest)
4. [Unit Test](#unit-test)
5. [Integration Test (supertest)](#integration-test)
6. [Mocking](#mocking)
7. [Code Coverage](#code-coverage)
8. [TDD / BDD](#tdd--bdd)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao cần Test?

- Phát hiện bug sớm (trước khi deploy).
- Refactor tự tin (test đảm bảo logic không đổi).
- Documentation sống (test mô tả behavior).
- CI/CD gateway (test fail → không deploy).

---

## Test Pyramid

```
        /  E2E  \          ← ít, chậm, đắt
       /─────────\
      / Integration\       ← trung bình
     /──────────────\
    /    Unit Tests   \    ← nhiều, nhanh, rẻ
   /───────────────────\
```

---

## Jest

```bash
npm install --save-dev jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Cú pháp cơ bản

```javascript
// math.js
function add(a, b) { return a + b; }
function divide(a, b) {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}
module.exports = { add, divide };

// math.test.js
const { add, divide } = require('./math');

describe('Math functions', () => {
  describe('add', () => {
    test('adds two numbers', () => {
      expect(add(1, 2)).toBe(3);
    });

    test('adds negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });
  });

  describe('divide', () => {
    test('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    test('throws on divide by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

### Matchers phổ biến

```javascript
expect(value).toBe(42);              // === (primitive)
expect(obj).toEqual({ a: 1 });       // deep equality
expect(arr).toContain('item');
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
expect(value).toBeGreaterThan(10);
expect(str).toMatch(/regex/);
expect(fn).toThrow(Error);
expect(arr).toHaveLength(3);
expect(obj).toHaveProperty('key', 'value');
```

### Setup / Teardown

```javascript
describe('UserService', () => {
  beforeAll(async () => { /* connect DB */ });
  afterAll(async () => { /* disconnect */ });
  beforeEach(async () => { /* clear data */ });
  afterEach(() => { /* cleanup */ });

  test('...', () => { });
});
```

---

## Unit Test

Test **một function/class** riêng lẻ, mock dependencies.

```javascript
// services/userService.js
class UserService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async getById(id) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

// services/userService.test.js
describe('UserService', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = { findById: jest.fn() };
    service = new UserService(mockRepo);
  });

  test('returns user when found', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, name: 'An' });

    const user = await service.getById(1);

    expect(user).toEqual({ id: 1, name: 'An' });
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });

  test('throws when user not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.getById(999)).rejects.toThrow('User not found');
  });
});
```

---

## Integration Test

Test **nhiều layers** cùng nhau (route → controller → DB). Dùng **supertest**.

```bash
npm install --save-dev supertest
```

```javascript
const request = require('supertest');
const app = require('../src/app'); // Express app (không listen)

describe('GET /api/users', () => {
  test('returns list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('POST /api/users', () => {
  test('creates user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'An', email: 'an@test.com', password: 'pass1234' })
      .expect(201);

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('An');
  });

  test('returns 400 with invalid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '' })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });
});

describe('Protected routes', () => {
  let token;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    token = res.body.token;
  });

  test('returns 401 without token', async () => {
    await request(app).get('/api/profile').expect(401);
  });

  test('returns profile with valid token', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email');
  });
});
```

---

## Mocking

```javascript
// Mock module
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

// Mock function
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'ok' });
mockFn.mockRejectedValue(new Error('fail'));
mockFn.mockImplementation((x) => x * 2);

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Spy
const spy = jest.spyOn(console, 'log').mockImplementation();
// ... test ...
expect(spy).toHaveBeenCalledWith('expected message');
spy.mockRestore();

// Timer mocks
jest.useFakeTimers();
setTimeout(callback, 1000);
jest.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();
jest.useRealTimers();
```

---

## Code Coverage

```bash
jest --coverage
```

```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.7  |   75.0   |  90.0   |   85.7  |
 math.js  |  100.0  |  100.0   | 100.0   |  100.0  |
 user.js  |   71.4  |   50.0   |  80.0   |   71.4  |
----------|---------|----------|---------|---------|
```

Mục tiêu: **>80%** coverage, focus vào business logic.

---

## TDD / BDD

**TDD** (Test-Driven Development):
1. Viết test (RED — test fail)
2. Viết code đủ để test pass (GREEN)
3. Refactor (REFACTOR)

**BDD** (Behavior-Driven Development):
```javascript
describe('User registration', () => {
  it('should create user with valid data', ...);
  it('should reject duplicate email', ...);
  it('should hash password before saving', ...);
});
```

---

## Câu hỏi phỏng vấn

**Q: Unit test vs Integration test?**

> Unit: test 1 function riêng lẻ, mock dependencies, nhanh. Integration: test nhiều layers cùng nhau (route → DB), chậm hơn nhưng phát hiện lỗi giữa các components.

**Q: Khi nào mock, khi nào không?**

> Mock: external services (email, payment, 3rd-party API), database (trong unit test). Không mock: business logic bên trong function đang test. Integration test: ít mock hơn, dùng test database.

**Q: Code coverage bao nhiêu là đủ?**

> 80% là mục tiêu phổ biến. 100% không thực tế và không đảm bảo bug-free. Focus vào test business logic quan trọng, edge cases, error paths.

---

**Tiếp theo**: [11 - Streams & Buffers](./11-Streams-Buffers.md)
