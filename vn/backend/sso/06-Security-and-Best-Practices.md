# Security và Best Practices - Câu hỏi phỏng vấn

## Mục lục
1. [SSO Security Considerations](#sso-security-considerations)
2. [Token Security](#token-security)
3. [Session Security](#session-security)
4. [Common Vulnerabilities](#common-vulnerabilities)
5. [Best Practices](#best-practices)
6. [Compliance](#compliance)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SSO Security Considerations

### 1. Authentication Security

**Considerations:**
- Strong password policies
- Password complexity requirements
- Account lockout policies
- Password expiration
- Password history

**Implementation:**
```yaml
Password Policy:
  - Minimum length: 12 characters
  - Require uppercase, lowercase, numbers, symbols
  - Maximum age: 90 days
  - Password history: 5 previous passwords
  - Account lockout: 5 failed attempts, 30 minutes
```

### 2. Transport Security

**Requirements:**
- Always use HTTPS
- TLS 1.2 or higher
- Certificate validation
- HSTS (HTTP Strict Transport Security)

**Implementation:**
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 3. Token Security

**Considerations:**
- Token encryption
- Token signing
- Token expiration
- Token storage
- Token transmission

---

## Token Security

### 1. Token Signing

**Best Practices:**
- Always sign tokens
- Use strong algorithms (RS256, ES256)
- Never use "none" algorithm
- Validate algorithm explicitly

**Example:**
```javascript
// Good: Explicit algorithm
jwt.verify(token, publicKey, {
  algorithms: ['RS256']  // Explicit
});

// Bad: No algorithm specified
jwt.verify(token, publicKey);  // Vulnerable to algorithm confusion
```

### 2. Token Encryption

**When to Encrypt:**
- Sensitive data in token
- Token contains PII
- Compliance requirements

**Implementation:**
```javascript
// JWE (JSON Web Encryption)
const encryptedToken = jwt.sign(payload, secret, {
  algorithm: 'dir',
  encryption: 'A256GCM'
});
```

### 3. Token Expiration

**Best Practices:**
- Short-lived access tokens (15-60 minutes)
- Long-lived refresh tokens (7-30 days)
- Validate expiration claims
- Implement token refresh

**Example:**
```javascript
const accessToken = jwt.sign(payload, secret, {
  expiresIn: '15m'  // Short-lived
});

const refreshToken = jwt.sign(payload, secret, {
  expiresIn: '7d'  // Long-lived
});
```

### 4. Token Storage

**Options:**
- **httpOnly Cookies**: Most secure (XSS protection)
- **Memory**: Secure but lost on refresh
- **localStorage**: Less secure (XSS vulnerable)
- **sessionStorage**: Similar to localStorage

**Recommendation:**
```javascript
// Use httpOnly cookies
res.cookie('access_token', token, {
  httpOnly: true,      // XSS protection
  secure: true,        // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 900000      // 15 minutes
});
```

### 5. Token Transmission

**Best Practices:**
- Use HTTPS only
- Use Authorization header (not URL)
- Avoid logging tokens
- Use Bearer token format

**Example:**
```javascript
// Good: Authorization header
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Bad: Token in URL
fetch(`https://api.example.com/data?token=${token}`);
```

---

## Session Security

### 1. Session Management

**Best Practices:**
- Secure session IDs
- Session timeout
- Session fixation protection
- Session regeneration after login

**Implementation:**
```javascript
// Regenerate session after login
req.session.regenerate((err) => {
  req.session.userId = user.id;
  req.session.save();
});
```

### 2. Session Storage

**Options:**
- **Database**: Persistent, scalable
- **Redis**: Fast, scalable
- **Memory**: Simple but not scalable

**Recommendation:**
```javascript
// Redis session store
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: 6379
  }),
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 3600000  // 1 hour
  }
}));
```

### 3. Session Timeout

**Best Practices:**
- Absolute timeout (max session duration)
- Idle timeout (inactivity timeout)
- Implement both

**Example:**
```javascript
// Session timeout middleware
function sessionTimeout(req, res, next) {
  if (req.session.lastAccess) {
    const idleTime = Date.now() - req.session.lastAccess;
    if (idleTime > 30 * 60 * 1000) {  // 30 minutes
      req.session.destroy();
      return res.redirect('/login');
    }
  }
  req.session.lastAccess = Date.now();
  next();
}
```

---

## Common Vulnerabilities

### 1. Token Theft

**Vulnerability:**
- Token stolen from client
- Attacker uses token

**Mitigation:**
- Use httpOnly cookies
- Use HTTPS
- Short token expiration
- Token binding (device fingerprint)

### 2. Token Replay

**Vulnerability:**
- Token reused after expiration
- Token reused from different location

**Mitigation:**
- Validate expiration
- Use nonce (jti claim)
- Token binding
- Rate limiting

### 3. Algorithm Confusion

**Vulnerability:**
- Attacker uses "none" algorithm
- Bypasses signature verification

**Mitigation:**
```javascript
// Always specify algorithm
jwt.verify(token, publicKey, {
  algorithms: ['RS256']  // Explicit
});
```

### 4. CSRF (Cross-Site Request Forgery)

**Vulnerability:**
- Attacker makes requests on user's behalf
- Uses user's session

**Mitigation:**
- SameSite cookies
- CSRF tokens
- Origin validation

**Example:**
```javascript
// SameSite cookie
res.cookie('session', sessionId, {
  sameSite: 'strict'  // CSRF protection
});
```

### 5. XSS (Cross-Site Scripting)

**Vulnerability:**
- Malicious scripts injected
- Steal tokens from localStorage

**Mitigation:**
- Use httpOnly cookies
- Input validation
- Output encoding
- CSP (Content Security Policy)

### 6. Man-in-the-Middle

**Vulnerability:**
- Attacker intercepts communication
- Steals tokens

**Mitigation:**
- Always use HTTPS
- Certificate pinning
- HSTS

---

## Best Practices

### 1. Authentication

- Strong password policies
- Multi-factor authentication
- Account lockout
- Password history
- Regular password changes

### 2. Token Management

- Short-lived access tokens
- Long-lived refresh tokens
- Secure token storage
- Token encryption when needed
- Always sign tokens

### 3. Session Management

- Secure session IDs
- Session timeout
- Session regeneration
- Secure session storage
- Session fixation protection

### 4. Transport Security

- Always use HTTPS
- TLS 1.2 or higher
- Certificate validation
- HSTS
- Certificate pinning (mobile)

### 5. Application Security

- Input validation
- Output encoding
- CSRF protection
- XSS protection
- Rate limiting

### 6. Monitoring và Logging

- Log authentication events
- Monitor failed logins
- Alert on suspicious activity
- Audit logs
- Security event logging

---

## Compliance

### GDPR (General Data Protection Regulation)

**Requirements:**
- User consent
- Data minimization
- Right to access
- Right to deletion
- Data portability

**Implementation:**
- Consent management
- User data export
- User data deletion
- Privacy policies

### SOC2 (Service Organization Control 2)

**Requirements:**
- Access controls
- Encryption
- Monitoring
- Incident response
- Change management

**Implementation:**
- Access logging
- Encryption at rest và in transit
- Security monitoring
- Incident response procedures

### HIPAA (Health Insurance Portability)

**Requirements:**
- Protected health information (PHI)
- Access controls
- Audit logs
- Encryption

**Implementation:**
- PHI protection
- Access controls
- Audit logging
- Encryption requirements

---

## Câu hỏi thường gặp

### Q1: Token security best practices?

**Best practices:**
- Always sign tokens
- Use strong algorithms
- Short expiration
- Secure storage (httpOnly cookies)
- HTTPS only

### Q2: Session security?

**Security:**
- Secure session IDs
- Session timeout
- Session regeneration
- Secure storage
- CSRF protection

### Q3: Common vulnerabilities?

**Vulnerabilities:**
- Token theft
- Token replay
- Algorithm confusion
- CSRF
- XSS
- Man-in-the-middle

### Q4: Compliance requirements?

**Compliance:**
- GDPR: User data protection
- SOC2: Security controls
- HIPAA: PHI protection

### Q5: Transport security?

**Security:**
- Always HTTPS
- TLS 1.2+
- Certificate validation
- HSTS

---

## Best Practices Summary

1. **Authentication**: Strong passwords, MFA
2. **Tokens**: Sign, encrypt, short expiration
3. **Sessions**: Secure storage, timeout
4. **Transport**: HTTPS, TLS 1.2+
5. **Application**: Input validation, CSRF, XSS protection
6. **Monitoring**: Logging, alerting, auditing
7. **Compliance**: GDPR, SOC2, HIPAA

---

## Bài tập thực hành

### Bài 1: Security Assessment

```
Yêu cầu:
1. Assess SSO security
2. Identify vulnerabilities
3. Implement mitigations
4. Test security controls
```

### Bài 2: Compliance Implementation

```
Yêu cầu:
1. Identify compliance requirements
2. Implement controls
3. Document procedures
4. Audit compliance
```

---

## Tổng kết

- **Security Considerations**: Authentication, transport, tokens
- **Token Security**: Signing, encryption, expiration, storage
- **Session Security**: Management, storage, timeout
- **Vulnerabilities**: Token theft, replay, CSRF, XSS
- **Best Practices**: Authentication, tokens, sessions, transport
- **Compliance**: GDPR, SOC2, HIPAA
