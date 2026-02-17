# SSO Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [SSO là gì?](#sso-là-gì)
2. [Benefits và Use Cases](#benefits-và-use-cases)
3. [SSO Architecture](#sso-architecture)
4. [Identity Provider vs Service Provider](#identity-provider-vs-service-provider)
5. [SSO vs Traditional Authentication](#sso-vs-traditional-authentication)
6. [Common SSO Protocols](#common-sso-protocols)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SSO là gì?

### Single Sign-On (SSO)

**Định nghĩa:**
- SSO là authentication mechanism
- Allows users to authenticate once
- Access multiple applications without re-authenticating
- Centralized authentication

### How SSO Works

**Basic Flow:**
1. User logs in to Identity Provider (IdP)
2. IdP authenticates user
3. User accesses Service Provider (SP) application
4. SP trusts IdP authentication
5. User accesses application without re-login

### Key Concepts

- **Identity Provider (IdP)**: Authenticates users
- **Service Provider (SP)**: Applications user wants to access
- **Trust Relationship**: SP trusts IdP authentication
- **Session**: Maintains authentication state

---

## Benefits và Use Cases

### Benefits

1. **User Experience**
   - Single login for multiple applications
   - No need to remember multiple passwords
   - Faster access to applications

2. **Security**
   - Centralized password management
   - Easier to enforce password policies
   - Reduced password fatigue
   - Centralized audit logging

3. **Administration**
   - Centralized user management
   - Easier provisioning/deprovisioning
   - Reduced support costs
   - Better compliance

4. **Cost**
   - Reduced password reset requests
   - Lower support costs
   - Improved productivity

### Use Cases

1. **Enterprise Applications**
   - Multiple internal applications
   - Employee portal
   - Intranet services

2. **SaaS Applications**
   - Cloud-based services
   - Third-party integrations
   - Partner applications

3. **Federation**
   - Cross-organization access
   - Partner collaboration
   - B2B integrations

---

## SSO Architecture

### Basic Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │────────▶│ Identity     │────────▶│   Service   │
│             │         │ Provider     │         │  Provider   │
│             │         │   (IdP)      │         │    (SP)     │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Components

1. **Identity Provider (IdP)**
   - Authenticates users
   - Issues authentication tokens
   - Manages user identities

2. **Service Provider (SP)**
   - Applications user accesses
   - Trusts IdP authentication
   - Validates tokens

3. **User**
   - Initiates authentication
   - Accesses applications

### Trust Relationship

**Định nghĩa:**
- SP trusts IdP to authenticate users
- Established through:
  - Certificate exchange
  - Metadata sharing
  - Configuration

---

## Identity Provider vs Service Provider

### Identity Provider (IdP)

**Định nghĩa:**
- Authenticates users
- Issues authentication assertions/tokens
- Examples: Okta, Azure AD, Auth0, Keycloak

**Responsibilities:**
- User authentication
- Identity management
- Token/assertion issuance
- Session management

### Service Provider (SP)

**Định nghĩa:**
- Applications user accesses
- Trusts IdP authentication
- Examples: Web applications, APIs, Services

**Responsibilities:**
- Accept authentication from IdP
- Validate tokens/assertions
- Grant access to resources
- Manage application sessions

### Relationship

```
IdP: "I authenticate this user"
SP: "I trust IdP, user is authenticated"
```

---

## SSO vs Traditional Authentication

### Traditional Authentication

**Đặc điểm:**
- Each application has own authentication
- User logs in to each application separately
- Separate user databases
- No shared session

**Flow:**
```
User → App1 (login) → App1 (access)
User → App2 (login) → App2 (access)
User → App3 (login) → App3 (access)
```

### SSO Authentication

**Đặc điểm:**
- Single authentication for all applications
- Shared session
- Centralized identity management
- Trust relationship between SPs và IdP

**Flow:**
```
User → IdP (login once) → App1 (access)
                        → App2 (access)
                        → App3 (access)
```

### Comparison

| Feature | Traditional | SSO |
|---------|-------------|-----|
| **Logins** | Multiple | Single |
| **User Management** | Distributed | Centralized |
| **Password Management** | Per application | Centralized |
| **User Experience** | Poor | Better |
| **Security** | Variable | Consistent |
| **Administration** | Complex | Simpler |

---

## Common SSO Protocols

### 1. SAML (Security Assertion Markup Language)

**Định nghĩa:**
- XML-based protocol
- Enterprise SSO standard
- Widely used in enterprise

**Use Cases:**
- Enterprise applications
- B2B integrations
- Government applications

### 2. OAuth2

**Định nghĩa:**
- Authorization framework
- Not authentication protocol (but used for SSO)
- Token-based

**Use Cases:**
- API access
- Third-party integrations
- Mobile applications

### 3. OpenID Connect (OIDC)

**Định nghĩa:**
- Authentication layer on OAuth2
- Identity layer
- Modern SSO protocol

**Use Cases:**
- Web applications
- Mobile applications
- Modern SSO implementations

### 4. LDAP/Active Directory

**Định nghĩa:**
- Directory services
- Not SSO protocol but used with SSO
- User directory

**Use Cases:**
- Enterprise directories
- User management
- Integration with SSO

### Protocol Comparison

| Protocol | Type | Use Case | Complexity |
|----------|------|----------|------------|
| **SAML** | XML-based | Enterprise | High |
| **OAuth2** | Token-based | APIs | Medium |
| **OIDC** | Token-based | Modern apps | Medium |
| **LDAP** | Directory | User store | Medium |

---

## Câu hỏi thường gặp

### Q1: SSO là gì?

**SSO (Single Sign-On):**
- Authentication mechanism
- User authenticates once
- Accesses multiple applications
- Centralized authentication

### Q2: IdP vs SP?

**Identity Provider (IdP):**
- Authenticates users
- Issues tokens/assertions
- Examples: Okta, Azure AD

**Service Provider (SP):**
- Applications user accesses
- Trusts IdP
- Examples: Web apps, APIs

### Q3: SSO benefits?

**Benefits:**
- Better user experience
- Centralized security
- Easier administration
- Reduced costs

### Q4: SSO protocols?

**Common protocols:**
- SAML: Enterprise SSO
- OAuth2: Authorization
- OIDC: Modern SSO
- LDAP: Directory services

### Q5: SSO vs Traditional?

**SSO:**
- Single login
- Centralized
- Better UX

**Traditional:**
- Multiple logins
- Distributed
- Poor UX

### Q6: Trust relationship?

**Trust relationship:**
- SP trusts IdP authentication
- Established through certificates/metadata
- Required for SSO to work

---

## Best Practices

1. **Use Standard Protocols**: SAML, OIDC
2. **Secure Communication**: HTTPS, certificates
3. **Token Security**: Secure token storage
4. **Session Management**: Proper session handling
5. **Audit Logging**: Log authentication events
6. **Multi-factor Authentication**: Add MFA for security

---

## Bài tập thực hành

### Bài 1: SSO Architecture

```
Yêu cầu:
1. Design SSO architecture
2. Identify IdP và SPs
3. Define trust relationships
4. Document authentication flow
```

### Bài 2: Protocol Comparison

```
Yêu cầu:
1. Compare SAML vs OAuth2 vs OIDC
2. Identify use cases for each
3. Choose protocol for scenario
4. Justify choice
```

---

## Tổng kết

- **SSO**: Single Sign-On authentication
- **IdP**: Identity Provider (authenticates)
- **SP**: Service Provider (applications)
- **Protocols**: SAML, OAuth2, OIDC
- **Benefits**: Better UX, security, administration
- **Architecture**: IdP, SP, trust relationship
