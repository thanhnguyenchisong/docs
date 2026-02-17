# OAuth2 và OpenID Connect - Câu hỏi phỏng vấn

## Mục lục
1. [OAuth2 là gì?](#oauth2-là-gì)
2. [OAuth2 Roles](#oauth2-roles)
3. [OAuth2 Grant Types](#oauth2-grant-types)
4. [OpenID Connect (OIDC)](#openid-connect-oidc)
5. [OIDC vs OAuth2](#oidc-vs-oauth2)
6. [Implementation Examples](#implementation-examples)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## OAuth2 là gì?

### OAuth2 (Open Authorization 2.0)

**Định nghĩa:**
- Authorization framework
- Allows applications to access resources
- On behalf of resource owner
- **Not authentication protocol** (but used for SSO)

### Key Concepts

- **Authorization**: Permission to access resources
- **Delegation**: Application acts on user's behalf
- **Tokens**: Access tokens for API access
- **Scopes**: Define what can be accessed

### OAuth2 vs Authentication

**OAuth2:**
- Authorization framework
- "Can this app access my data?"
- Not about "Who are you?"

**But:**
- Often used with authentication
- OIDC adds authentication layer

---

## OAuth2 Roles

### 1. Resource Owner

**Định nghĩa:**
- User who owns resources
- Grants access to applications
- Example: User with Google account

### 2. Client

**Định nghĩa:**
- Application requesting access
- Can be web app, mobile app, server
- Example: Third-party application

### 3. Authorization Server

**Định nghĩa:**
- Issues access tokens
- Authenticates resource owner
- Example: Google OAuth, Auth0

### 4. Resource Server

**Định nghĩa:**
- Hosts protected resources
- Validates access tokens
- Example: Google API, GitHub API

### Role Diagram

```
Resource Owner → Client → Authorization Server → Resource Server
     (User)      (App)        (Issues tokens)    (Validates tokens)
```

---

## OAuth2 Grant Types

### 1. Authorization Code

**Use Case:**
- Web applications
- Server-side applications
- Most secure

**Flow:**
1. Client redirects user to Authorization Server
2. User authenticates và authorizes
3. Authorization Server redirects với authorization code
4. Client exchanges code for access token
5. Client uses access token to access resources

**Example:**
```
User → Client → Auth Server (login) → Client (code) → Auth Server (token) → Resource Server
```

### 2. Implicit

**Use Case:**
- Single-page applications (SPA)
- Mobile apps
- Less secure (deprecated)

**Flow:**
1. Client redirects user to Authorization Server
2. User authenticates và authorizes
3. Authorization Server redirects với access token (in URL fragment)
4. Client uses access token

**Note:** Deprecated in favor of Authorization Code với PKCE

### 3. Client Credentials

**Use Case:**
- Server-to-server communication
- Machine-to-machine
- No user involved

**Flow:**
1. Client authenticates với credentials
2. Authorization Server issues access token
3. Client uses access token

**Example:**
```
Client → Auth Server (credentials) → Access Token → Resource Server
```

### 4. Resource Owner Password Credentials

**Use Case:**
- Trusted applications
- Legacy systems
- Not recommended

**Flow:**
1. Client sends username/password
2. Authorization Server validates và issues token
3. Client uses access token

**Note:** Not recommended, security risk

### 5. Refresh Token

**Use Case:**
- Obtain new access tokens
- Without re-authentication
- Long-lived sessions

**Flow:**
1. Client has refresh token
2. Client requests new access token
3. Authorization Server issues new access token

---

## OpenID Connect (OIDC)

### OIDC là gì?

**Định nghĩa:**
- Authentication layer on OAuth2
- Adds identity information
- Standard for modern SSO
- Uses OAuth2 flow với ID Token

### OIDC Components

1. **ID Token**: JWT containing identity info
2. **UserInfo Endpoint**: Get user attributes
3. **Discovery**: Automatic configuration
4. **Standard Claims**: Standardized user attributes

### OIDC Flow

**Flow (Authorization Code):**
1. Client redirects user to Authorization Server
2. User authenticates
3. Authorization Server redirects với authorization code
4. Client exchanges code for:
   - Access Token (for API access)
   - ID Token (JWT với identity)
   - Refresh Token (optional)
5. Client validates ID Token
6. Client can call UserInfo endpoint for more attributes

### ID Token

**Structure (JWT):**
```json
{
  "iss": "https://auth.example.com",
  "sub": "user123",
  "aud": "client123",
  "exp": 1234567890,
  "iat": 1234567890,
  "auth_time": 1234567890,
  "nonce": "random123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### UserInfo Endpoint

**Request:**
```
GET /userinfo
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "sub": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

---

## OIDC vs OAuth2

### OAuth2

**Purpose:**
- Authorization
- "Can app access my data?"

**Tokens:**
- Access Token only
- For API access

**Use Case:**
- API authorization
- Third-party access

### OIDC

**Purpose:**
- Authentication + Authorization
- "Who are you?" + "Can app access?"

**Tokens:**
- Access Token (API access)
- ID Token (identity)
- Refresh Token

**Use Case:**
- SSO
- User authentication
- Identity information

### Comparison

| Feature | OAuth2 | OIDC |
|---------|--------|------|
| **Purpose** | Authorization | Authentication + Authorization |
| **Tokens** | Access Token | Access + ID Token |
| **Identity** | No | Yes (ID Token) |
| **Use Case** | API access | SSO |
| **Standard** | RFC 6749 | OpenID Connect |

---

## Implementation Examples

### Authorization Code Flow

**Step 1: Authorization Request**
```
GET /authorize?
  response_type=code
  &client_id=client123
  &redirect_uri=https://app.com/callback
  &scope=openid profile email
  &state=random123
```

**Step 2: Authorization Response**
```
GET /callback?code=abc123&state=random123
```

**Step 3: Token Request**
```
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=abc123
&redirect_uri=https://app.com/callback
&client_id=client123
&client_secret=secret123
```

**Step 4: Token Response**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def456...",
  "id_token": "eyJhbGc..."
}
```

### PKCE (Proof Key for Code Exchange)

**Purpose:**
- Security enhancement
- For public clients (mobile, SPA)
- Prevents code interception

**Flow:**
1. Client generates code_verifier (random string)
2. Client creates code_challenge (hash of verifier)
3. Client sends code_challenge in authorization request
4. Client sends code_verifier in token request
5. Server verifies challenge matches verifier

---

## Câu hỏi thường gặp

### Q1: OAuth2 là gì?

**OAuth2:**
- Authorization framework
- Allows apps to access resources
- On behalf of user
- Not authentication (but used for SSO)

### Q2: OAuth2 grant types?

**Grant types:**
- Authorization Code: Web apps (most secure)
- Implicit: SPA (deprecated)
- Client Credentials: Server-to-server
- Password: Not recommended
- Refresh Token: Get new tokens

### Q3: OIDC vs OAuth2?

**OAuth2:**
- Authorization only
- Access Token

**OIDC:**
- Authentication + Authorization
- Access Token + ID Token
- Identity information

### Q4: ID Token?

**ID Token:**
- JWT containing identity
- Issued by OIDC
- Contains user info
- Signed by Authorization Server

### Q5: Authorization Code flow?

**Flow:**
1. User → Auth Server (authorize)
2. Auth Server → Client (code)
3. Client → Auth Server (exchange code)
4. Auth Server → Client (tokens)
5. Client → Resource Server (access)

### Q6: PKCE?

**PKCE:**
- Security enhancement
- For public clients
- Prevents code interception
- Code challenge/verifier

---

## Best Practices

1. **Use Authorization Code**: Most secure
2. **Use PKCE**: For public clients
3. **Validate Tokens**: Always validate
4. **Use HTTPS**: Secure transport
5. **Store Tokens Securely**: Don't expose tokens
6. **Use Refresh Tokens**: For long sessions
7. **Scope Limitation**: Request minimum scopes

---

## Bài tập thực hành

### Bài 1: OAuth2 Flow

```
Yêu cầu:
1. Implement Authorization Code flow
2. Handle token exchange
3. Access protected resources
4. Implement refresh token
```

### Bài 2: OIDC Implementation

```
Yêu cầu:
1. Implement OIDC flow
2. Validate ID Token
3. Call UserInfo endpoint
4. Handle user attributes
```

---

## Tổng kết

- **OAuth2**: Authorization framework
- **Roles**: Resource Owner, Client, Authorization Server, Resource Server
- **Grant Types**: Authorization Code, Implicit, Client Credentials, etc.
- **OIDC**: Authentication layer on OAuth2
- **ID Token**: JWT với identity info
- **PKCE**: Security enhancement
