# Implementation Patterns - Câu hỏi phỏng vấn

## Mục lục
1. [SSO Architecture Patterns](#sso-architecture-patterns)
2. [Federation Patterns](#federation-patterns)
3. [Token-based Authentication](#token-based-authentication)
4. [Session Management](#session-management)
5. [Multi-factor Authentication (MFA)](#multi-factor-authentication-mfa)
6. [SSO Integration với Applications](#sso-integration-với-applications)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SSO Architecture Patterns

### 1. Centralized SSO

**Pattern:**
- Single Identity Provider
- All applications trust same IdP
- Simple architecture

**Diagram:**
```
     ┌─────────┐
     │   IdP   │
     └────┬────┘
          │
    ┌─────┼─────┐
    │     │     │
  ┌─▼─┐ ┌─▼─┐ ┌─▼─┐
  │SP1│ │SP2│ │SP3│
  └───┘ └───┘ └───┘
```

**Use Case:**
- Enterprise internal applications
- Single organization
- Centralized control

### 2. Federated SSO

**Pattern:**
- Multiple Identity Providers
- Cross-organization trust
- Federation protocol (SAML, OIDC)

**Diagram:**
```
  ┌─────┐      ┌─────┐
  │IdP1 │      │IdP2 │
  └──┬──┘      └──┬──┘
     │            │
     └──────┬─────┘
            │
        ┌───▼───┐
        │  SP   │
        └───────┘
```

**Use Case:**
- B2B integrations
- Partner access
- Cross-organization SSO

### 3. Hub-and-Spoke

**Pattern:**
- Central hub (Identity Broker)
- Multiple IdPs connect to hub
- Hub connects to SPs

**Diagram:**
```
  ┌─────┐  ┌─────┐
  │IdP1 │  │IdP2 │
  └──┬──┘  └──┬──┘
     │        │
     └───┬────┘
         │
    ┌────▼────┐
    │   Hub   │
    └────┬────┘
         │
    ┌────┼────┐
  ┌─▼─┐ ┌─▼─┐ ┌─▼─┐
  │SP1│ │SP2│ │SP3│
  └───┘ └───┘ └───┘
```

**Use Case:**
- Multiple IdPs
- Centralized management
- Identity brokering

---

## Federation Patterns

### 1. SAML Federation

**Pattern:**
- SAML-based federation
- Metadata exchange
- Trust relationships

**Implementation:**
1. Exchange metadata
2. Configure trust
3. Establish certificates
4. Configure endpoints

### 2. OIDC Federation

**Pattern:**
- OIDC-based federation
- Discovery endpoint
- Dynamic registration

**Implementation:**
1. Discovery endpoint
2. Dynamic client registration
3. Token exchange
4. UserInfo sharing

### 3. Identity Broker Pattern

**Pattern:**
- Broker mediates between IdPs và SPs
- Protocol translation
- Identity mapping

**Use Case:**
- Multiple IdPs
- Protocol differences
- Identity transformation

---

## Token-based Authentication

### Access Token Pattern

**Flow:**
1. User authenticates
2. IdP issues access token
3. Client uses token for API calls
4. Resource server validates token

**Implementation:**
```javascript
// Client receives token
const accessToken = response.access_token;

// Use token for API calls
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### ID Token Pattern (OIDC)

**Flow:**
1. User authenticates
2. IdP issues ID token (JWT)
3. Client validates ID token
4. Client extracts user info

**Implementation:**
```javascript
// Validate ID token
const decoded = jwt.verify(idToken, publicKey);

// Extract user info
const userId = decoded.sub;
const email = decoded.email;
```

### Refresh Token Pattern

**Flow:**
1. Access token expires
2. Client uses refresh token
3. IdP issues new access token
4. Client continues using new token

**Implementation:**
```javascript
// Refresh access token
const response = await fetch('https://auth.example.com/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })
});

const { access_token } = await response.json();
```

---

## Session Management

### Server-side Sessions

**Pattern:**
- Session stored on server
- Session ID in cookie
- Server validates session

**Implementation:**
```javascript
// Create session
req.session.userId = user.id;
req.session.save();

// Validate session
if (req.session.userId) {
  // User authenticated
}
```

### Client-side Sessions (JWT)

**Pattern:**
- JWT stored on client
- Token contains session info
- Stateless validation

**Implementation:**
```javascript
// Create JWT session
const token = jwt.sign({
  userId: user.id,
  exp: Math.floor(Date.now() / 1000) + 3600
}, secret);

// Validate JWT
const decoded = jwt.verify(token, secret);
```

### Hybrid Approach

**Pattern:**
- Short-lived JWT access token
- Long-lived refresh token
- Server-side session for refresh token

**Benefits:**
- Stateless for access
- Revocable refresh tokens
- Balance between security và scalability

---

## Multi-factor Authentication (MFA)

### MFA là gì?

**Định nghĩa:**
- Multiple authentication factors
- Something you know (password)
- Something you have (phone, token)
- Something you are (biometric)

### MFA Types

#### 1. TOTP (Time-based One-Time Password)

**Implementation:**
- Google Authenticator
- Authy
- Hardware tokens

**Flow:**
1. User enters password
2. User enters TOTP code
3. System validates both
4. Access granted

#### 2. SMS/Email OTP

**Implementation:**
- Send code via SMS/Email
- User enters code
- Validate code

**Flow:**
1. User enters password
2. System sends OTP
3. User enters OTP
4. System validates
5. Access granted

#### 3. Push Notification

**Implementation:**
- Push to mobile app
- User approves
- Access granted

**Flow:**
1. User enters password
2. Push sent to device
3. User approves
4. Access granted

### MFA Integration với SSO

**Pattern:**
- MFA at IdP
- After initial authentication
- Before issuing tokens

**Flow:**
```
User → IdP (password) → MFA challenge → MFA validation → Token issued
```

---

## SSO Integration với Applications

### Web Application Integration

#### SAML Integration

**Steps:**
1. Configure SP metadata
2. Exchange metadata với IdP
3. Implement SAML handler
4. Validate assertions
5. Create user session

**Example (Spring Security):**
```java
@Configuration
public class SamlConfig {
    @Bean
    public RelyingPartyRegistration relyingPartyRegistration() {
        return RelyingPartyRegistration
            .withRegistrationId("saml-idp")
            .assertingPartyDetails(party -> party
                .entityId("https://idp.example.com")
                .singleSignOnServiceLocation("https://idp.example.com/sso")
                .wantAuthnRequestsSigned(false)
                .verificationX509Credentials(c -> c.add(...))
            )
            .build();
    }
}
```

#### OIDC Integration

**Steps:**
1. Register client với IdP
2. Configure redirect URI
3. Implement OIDC flow
4. Validate ID token
5. Create user session

**Example (Spring Security):**
```java
@Configuration
public class OidcConfig {
    @Bean
    public ClientRegistration clientRegistration() {
        return ClientRegistration
            .withRegistrationId("oidc")
            .clientId("client-id")
            .clientSecret("client-secret")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("https://app.com/login/oauth2/code/oidc")
            .scope("openid", "profile", "email")
            .authorizationUri("https://auth.example.com/authorize")
            .tokenUri("https://auth.example.com/token")
            .userInfoUri("https://auth.example.com/userinfo")
            .userNameAttributeName("sub")
            .build();
    }
}
```

### API Integration

**Pattern:**
- Token-based authentication
- Validate access tokens
- Extract user info from token

**Example:**
```javascript
// Middleware to validate token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  try {
    const decoded = jwt.verify(token, publicKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
}
```

### Mobile Application Integration

**Pattern:**
- OAuth2 Authorization Code với PKCE
- OIDC for authentication
- Secure token storage

**Example:**
```javascript
// PKCE flow
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Authorization request
const authUrl = `https://auth.example.com/authorize?
  client_id=${clientId}
  &redirect_uri=${redirectUri}
  &response_type=code
  &scope=openid profile
  &code_challenge=${codeChallenge}
  &code_challenge_method=S256`;

// Exchange code
const tokenResponse = await exchangeCode(code, codeVerifier);
```

---

## Câu hỏi thường gặp

### Q1: SSO architecture patterns?

**Patterns:**
- Centralized: Single IdP
- Federated: Multiple IdPs
- Hub-and-Spoke: Central broker

### Q2: Token-based authentication?

**Patterns:**
- Access Token: API access
- ID Token: User identity
- Refresh Token: Get new tokens

### Q3: Session management?

**Approaches:**
- Server-side: Stored on server
- Client-side: JWT on client
- Hybrid: Short JWT + refresh token

### Q4: MFA integration?

**MFA types:**
- TOTP: Time-based codes
- SMS/Email OTP: One-time codes
- Push: Mobile approval

### Q5: Application integration?

**Integration:**
- Web: SAML/OIDC
- API: Token validation
- Mobile: OAuth2 với PKCE

---

## Best Practices

1. **Choose Right Pattern**: Based on requirements
2. **Secure Token Storage**: httpOnly cookies
3. **Token Validation**: Always validate
4. **MFA**: Enable for sensitive apps
5. **Session Management**: Appropriate approach
6. **Error Handling**: Proper error handling

---

## Bài tập thực hành

### Bài 1: SSO Architecture

```
Yêu cầu:
1. Design SSO architecture
2. Choose appropriate pattern
3. Document integration points
4. Define trust relationships
```

### Bài 2: Application Integration

```
Yêu cầu:
1. Integrate web app với SSO
2. Implement token validation
3. Handle session management
4. Add MFA support
```

---

## Tổng kết

- **Architecture Patterns**: Centralized, Federated, Hub-and-Spoke
- **Federation**: SAML, OIDC, Identity Broker
- **Token-based**: Access, ID, Refresh tokens
- **Session Management**: Server-side, Client-side, Hybrid
- **MFA**: TOTP, OTP, Push
- **Integration**: Web, API, Mobile
