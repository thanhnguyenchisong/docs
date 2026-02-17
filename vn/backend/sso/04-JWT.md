# JWT (JSON Web Tokens) - Câu hỏi phỏng vấn

## Mục lục
1. [JWT là gì?](#jwt-là-gì)
2. [JWT Structure](#jwt-structure)
3. [JWT Claims](#jwt-claims)
4. [JWT Signing](#jwt-signing)
5. [JWT vs Session Tokens](#jwt-vs-session-tokens)
6. [JWT Security](#jwt-security)
7. [JWT Best Practices](#jwt-best-practices)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## JWT là gì?

### JWT (JSON Web Token)

**Định nghĩa:**
- Compact, URL-safe token format
- Represents claims between parties
- Self-contained (contains all info)
- Stateless authentication

### Key Features

1. **Self-contained**: All info in token
2. **Stateless**: No server-side storage
3. **Compact**: Small size
4. **Signed**: Can be verified
5. **Standard**: RFC 7519

### Use Cases

- **Authentication**: User identity
- **Authorization**: Access control
- **Information Exchange**: Secure data transfer
- **SSO**: Single Sign-On tokens

---

## JWT Structure

### JWT Format

**Structure:**
```
header.payload.signature
```

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Three Parts

#### 1. Header

**Contains:**
- Token type (JWT)
- Signing algorithm (HS256, RS256, etc.)

**Example:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Encoded:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

#### 2. Payload

**Contains:**
- Claims (user data)
- Standard claims (iss, sub, exp, etc.)
- Custom claims

**Example:**
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Encoded:** `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

#### 3. Signature

**Purpose:**
- Verify token integrity
- Verify sender identity
- Prevent tampering

**Calculation:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Encoded:** `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

---

## JWT Claims

### Claim Types

#### 1. Registered Claims

**Standard claims (RFC 7519):**
- `iss` (issuer): Who issued token
- `sub` (subject): User identifier
- `aud` (audience): Intended recipient
- `exp` (expiration): Expiration time
- `nbf` (not before): Not valid before
- `iat` (issued at): When issued
- `jti` (JWT ID): Unique token ID

#### 2. Public Claims

**Defined in IANA registry:**
- `email`: User email
- `name`: User name
- `picture`: User picture URL

#### 3. Private Claims

**Custom claims:**
- Application-specific
- Agreed upon by parties

### Claim Example

```json
{
  "iss": "https://auth.example.com",
  "sub": "user123",
  "aud": "api.example.com",
  "exp": 1516242622,
  "iat": 1516239022,
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["admin", "user"],
  "custom_claim": "value"
}
```

---

## JWT Signing

### Signing Algorithms

#### 1. HMAC (Symmetric)

**Algorithms:**
- HS256: HMAC SHA-256
- HS384: HMAC SHA-384
- HS512: HMAC SHA-512

**Characteristics:**
- Same secret for signing và verification
- Fast
- Secret must be shared securely

**Example:**
```javascript
// Sign
const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

// Verify
const decoded = jwt.verify(token, secret);
```

#### 2. RSA (Asymmetric)

**Algorithms:**
- RS256: RSA SHA-256
- RS384: RSA SHA-384
- RS512: RSA SHA-512

**Characteristics:**
- Private key for signing
- Public key for verification
- More secure
- Slower

**Example:**
```javascript
// Sign
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

// Verify
const decoded = jwt.verify(token, publicKey);
```

#### 3. ECDSA (Elliptic Curve)

**Algorithms:**
- ES256: ECDSA P-256 SHA-256
- ES384: ECDSA P-384 SHA-384
- ES512: ECDSA P-521 SHA-512

**Characteristics:**
- Smaller keys than RSA
- Fast
- Good security

### Algorithm Selection

**HMAC:**
- Same party signs và verifies
- Fast performance
- Shared secret

**RSA/ECDSA:**
- Different parties (IdP signs, SP verifies)
- Better for distributed systems
- Public key distribution

---

## JWT vs Session Tokens

### Session Tokens

**Characteristics:**
- Stored on server
- Reference only (session ID)
- Server-side validation
- Can be revoked
- Requires server storage

**Flow:**
```
User → Login → Server creates session → Session ID → User stores ID
User → Request → Server validates session → Access granted
```

### JWT Tokens

**Characteristics:**
- Self-contained
- No server storage
- Client-side validation possible
- Cannot be revoked easily
- Stateless

**Flow:**
```
User → Login → Server creates JWT → JWT → User stores JWT
User → Request → Server validates JWT → Access granted
```

### Comparison

| Feature | Session Token | JWT |
|---------|--------------|-----|
| **Storage** | Server | Client |
| **Validation** | Server-side | Can be client-side |
| **Revocation** | Easy | Difficult |
| **Stateless** | No | Yes |
| **Size** | Small (ID only) | Larger (contains data) |
| **Scalability** | Requires shared storage | No storage needed |

---

## JWT Security

### Security Considerations

#### 1. Token Theft

**Risk:**
- Token stolen from client
- Attacker uses token

**Mitigation:**
- Use HTTPS
- Secure storage (httpOnly cookies)
- Short expiration
- Refresh tokens

#### 2. Token Tampering

**Risk:**
- Token modified
- Claims changed

**Mitigation:**
- Always verify signature
- Use strong algorithms
- Validate all claims

#### 3. Token Replay

**Risk:**
- Token reused
- After expiration

**Mitigation:**
- Short expiration
- Validate exp claim
- Use nonce (jti claim)

#### 4. Algorithm Confusion

**Risk:**
- Attacker uses "none" algorithm
- Bypasses signature verification

**Mitigation:**
- Explicitly specify algorithm
- Reject "none" algorithm
- Validate algorithm

### Security Best Practices

1. **Always Verify Signature**: Never trust unsigned tokens
2. **Validate Claims**: Check exp, iss, aud, etc.
3. **Use HTTPS**: Encrypt in transit
4. **Short Expiration**: Limit token lifetime
5. **Secure Storage**: Use httpOnly cookies
6. **Strong Algorithms**: Use RS256 or ES256
7. **Validate Algorithm**: Explicitly specify algorithm

---

## JWT Best Practices

### 1. Token Structure

```json
{
  "iss": "https://auth.example.com",
  "sub": "user123",
  "aud": "api.example.com",
  "exp": 1516242622,
  "iat": 1516239022,
  "jti": "unique-token-id",
  "email": "user@example.com",
  "roles": ["admin"]
}
```

### 2. Expiration

```javascript
// Short-lived access token
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

// Long-lived refresh token
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
```

### 3. Validation

```javascript
try {
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'],  // Explicit algorithm
    issuer: 'https://auth.example.com',
    audience: 'api.example.com'
  });
  
  // Check expiration
  if (decoded.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
} catch (error) {
  // Handle error
}
```

### 4. Storage

**Options:**
- **httpOnly Cookies**: Most secure (XSS protection)
- **localStorage**: Less secure (XSS vulnerable)
- **sessionStorage**: Similar to localStorage
- **Memory**: Most secure but lost on refresh

**Recommendation:** Use httpOnly cookies for sensitive tokens

---

## Câu hỏi thường gặp

### Q1: JWT là gì?

**JWT:**
- JSON Web Token
- Self-contained token format
- Contains claims (user data)
- Signed for verification

### Q2: JWT structure?

**Structure:**
- Header: Algorithm và type
- Payload: Claims (data)
- Signature: Verification

**Format:** `header.payload.signature`

### Q3: JWT vs Session?

**JWT:**
- Self-contained
- Stateless
- Cannot revoke easily

**Session:**
- Server-stored
- Stateful
- Can revoke easily

### Q4: JWT signing?

**Algorithms:**
- HMAC: Symmetric (HS256)
- RSA: Asymmetric (RS256)
- ECDSA: Elliptic curve (ES256)

### Q5: JWT security?

**Security:**
- Always verify signature
- Validate claims
- Use HTTPS
- Short expiration
- Secure storage

### Q6: JWT claims?

**Claim types:**
- Registered: Standard (iss, sub, exp)
- Public: IANA registry
- Private: Custom claims

---

## Best Practices

1. **Verify Signature**: Always verify
2. **Validate Claims**: Check exp, iss, aud
3. **Use HTTPS**: Encrypt in transit
4. **Short Expiration**: Limit lifetime
5. **Secure Storage**: httpOnly cookies
6. **Strong Algorithms**: RS256 or ES256
7. **Explicit Algorithm**: Specify algorithm

---

## Bài tập thực hành

### Bài 1: JWT Creation

```
Yêu cầu:
1. Create JWT với claims
2. Sign với different algorithms
3. Decode và verify
4. Handle expiration
```

### Bài 2: JWT Security

```
Yêu cầu:
1. Implement signature verification
2. Validate claims
3. Handle token expiration
4. Implement refresh tokens
```

---

## Tổng kết

- **JWT**: JSON Web Token, self-contained
- **Structure**: Header.Payload.Signature
- **Claims**: Registered, Public, Private
- **Signing**: HMAC, RSA, ECDSA
- **Security**: Verify, validate, HTTPS
- **Best Practices**: Short expiration, secure storage
