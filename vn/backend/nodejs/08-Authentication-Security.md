# Authentication & Security

## Mục lục
1. [Authentication vs Authorization](#authentication-vs-authorization)
2. [Password Hashing (bcrypt)](#password-hashing)
3. [JWT (JSON Web Token)](#jwt)
4. [Passport.js](#passportjs)
5. [OAuth2 / Social Login](#oauth2)
6. [Security Best Practices](#security-best-practices)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Authentication vs Authorization

| | Authentication (AuthN) | Authorization (AuthZ) |
|---|----------------------|---------------------|
| Hỏi | **Bạn là ai?** | **Bạn được làm gì?** |
| Ví dụ | Login (email/password) | Role-based access |
| HTTP | 401 Unauthorized | 403 Forbidden |

---

## Password Hashing

**Không bao giờ** lưu password dạng plain text. Dùng **bcrypt** (chậm có chủ đích → chống brute-force).

```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');

// Hash
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash('myPassword123', SALT_ROUNDS);
// $2b$12$... (60 chars)

// Compare
const isMatch = await bcrypt.compare('myPassword123', hash); // true
const isWrong = await bcrypt.compare('wrongPassword', hash);  // false
```

### Register & Login flow

```javascript
// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check duplicate
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already exists' });

  // Hash password
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hash });

  res.status(201).json({ id: user.id, name: user.name });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token });
});
```

---

## JWT

### Cấu trúc

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJhbkBleC5jb20ifQ.xxxSignature
```

- **Header**: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload**: `{ "id": 1, "role": "admin", "iat": ..., "exp": ... }`
- **Signature**: `HMACSHA256(header + "." + payload, secret)`

### Sử dụng

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET; // >=256 bit random string

// Sign (tạo token)
const token = jwt.sign(
  { id: user.id, role: user.role },
  SECRET,
  { expiresIn: '7d' }
);

// Verify (kiểm tra token)
try {
  const decoded = jwt.verify(token, SECRET);
  // { id: 1, role: 'admin', iat: ..., exp: ... }
} catch (err) {
  // TokenExpiredError, JsonWebTokenError
}
```

### Auth Middleware

```javascript
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role-based authorization
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Sử dụng
app.get('/api/admin', auth, authorize('admin'), adminController);
app.get('/api/profile', auth, profileController);
```

### Refresh Token pattern

```javascript
// Login → trả access token (ngắn hạn) + refresh token (dài hạn)
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

// Lưu refreshToken vào DB hoặc httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
});

// Refresh endpoint
app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## Passport.js

```bash
npm install passport passport-local passport-jwt
```

```javascript
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}, async (payload, done) => {
  const user = await User.findById(payload.id);
  if (!user) return done(null, false);
  done(null, user);
}));

// Sử dụng
app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});
```

---

## OAuth2

```bash
npm install passport-google-oauth20
```

```javascript
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
    });
  }
  done(null, user);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/login?token=${token}`);
});
```

---

## Security Best Practices

### 1. Helmet (HTTP security headers)

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
// Adds: X-Content-Type-Options, X-Frame-Options, CSP, HSTS, ...
```

### 2. CORS

```bash
npm install cors
```

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://myapp.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,                  // tối đa 100 requests / window
  message: { error: 'Too many requests' },
}));

// Strict hơn cho login
app.use('/api/login', rateLimit({ windowMs: 60000, max: 5 }));
```

### 4. Sanitize input

```bash
npm install express-mongo-sanitize xss-clean
```

```javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // chống NoSQL injection: { "$gt": "" }

// Chống XSS
const xss = require('xss-clean');
app.use(xss());
```

### 5. OWASP checklist

| Threat | Giải pháp |
|--------|-----------|
| SQL/NoSQL Injection | Parameterized queries, ORM, sanitize |
| XSS | Helmet CSP, xss-clean, escape output |
| CSRF | SameSite cookie, CSRF token |
| Brute force | Rate limiting, account lockout |
| Sensitive data | HTTPS, hash passwords, .env |
| Broken auth | JWT expiry, refresh tokens, httpOnly cookies |

---

## Câu hỏi phỏng vấn

**Q: JWT lưu ở đâu — localStorage hay cookie?**

> **httpOnly cookie** an toàn hơn (không bị XSS đọc). localStorage dễ bị XSS. Nếu dùng cookie: set `httpOnly`, `secure`, `sameSite`. Nếu SPA cần lưu localStorage: kết hợp với short-lived access token + refresh token trong httpOnly cookie.

**Q: bcrypt vs SHA256 cho password?**

> bcrypt: chậm có chủ đích (cost factor), tự kèm salt, chống brute-force. SHA256: nhanh, không salt → dễ bị rainbow table, brute-force. **Luôn dùng bcrypt** (hoặc argon2) cho password.

**Q: Access Token vs Refresh Token?**

> Access Token: ngắn hạn (15m–1h), gửi trong Authorization header, dùng để truy cập API. Refresh Token: dài hạn (7–30 ngày), lưu trong httpOnly cookie, dùng để lấy access token mới. Nếu refresh token bị lộ → revoke trong DB.

---

**Tiếp theo**: [09 - Error Handling & Logging](./09-Error-Handling-Logging.md)
