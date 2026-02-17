# SAML - Câu hỏi phỏng vấn

## Mục lục
1. [SAML là gì?](#saml-là-gì)
2. [SAML Components](#saml-components)
3. [SAML Flow](#saml-flow)
4. [SAML 2.0 vs SAML 1.1](#saml-20-vs-saml-11)
5. [SAML Assertions](#saml-assertions)
6. [SAML Implementation](#saml-implementation)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SAML là gì?

### SAML (Security Assertion Markup Language)

**Định nghĩa:**
- XML-based protocol for SSO
- Exchanges authentication và authorization data
- Between Identity Provider (IdP) và Service Provider (SP)
- Standard: SAML 2.0

### Key Features

1. **XML-based**: Uses XML for data exchange
2. **Standard Protocol**: OASIS standard
3. **Enterprise SSO**: Widely used in enterprise
4. **Federation**: Supports cross-domain SSO
5. **Security**: Signed và encrypted assertions

### SAML Versions

- **SAML 1.0**: Initial version
- **SAML 1.1**: Enhanced version
- **SAML 2.0**: Current standard (most common)

---

## SAML Components

### 1. Assertions

**Định nghĩa:**
- Statements about authentication
- Contains user identity và attributes
- Signed by IdP
- Types: Authentication, Attribute, Authorization

### 2. Protocols

**Định nghĩa:**
- Define how SAML messages are exchanged
- Common protocols:
  - **Authentication Request Protocol**: SP requests authentication
  - **Assertion Query Protocol**: Query for assertions
  - **Artifact Resolution Protocol**: Resolve artifacts

### 3. Bindings

**Định nghĩa:**
- How SAML messages are transported
- Common bindings:
  - **HTTP Redirect**: GET request với SAML message
  - **HTTP POST**: POST request với SAML message
  - **HTTP Artifact**: Artifact reference instead of full message
  - **SOAP**: SOAP-based transport

### 4. Profiles

**Định nghĩa:**
- Specific use cases
- Common profiles:
  - **Web Browser SSO Profile**: Browser-based SSO
  - **Enhanced Client/Proxy Profile**: Mobile apps
  - **Identity Provider Discovery Profile**: IdP selection

---

## SAML Flow

### SP-Initiated Flow

**Flow:**
1. User accesses SP application
2. SP redirects user to IdP với SAML AuthnRequest
3. User authenticates at IdP
4. IdP creates SAML Response với Assertion
5. IdP redirects user back to SP với SAML Response
6. SP validates Assertion
7. SP grants access to user

**Diagram:**
```
User → SP → IdP (authenticate) → SP (with assertion) → Access granted
```

### IdP-Initiated Flow

**Flow:**
1. User logs in to IdP
2. User selects SP application
3. IdP creates SAML Response với Assertion
4. IdP redirects user to SP với SAML Response
5. SP validates Assertion
6. SP grants access to user

**Diagram:**
```
User → IdP (authenticate) → Select SP → SP (with assertion) → Access granted
```

### SAML Request (AuthnRequest)

**Example:**
```xml
<samlp:AuthnRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    ID="_abc123"
    Version="2.0"
    IssueInstant="2024-01-01T12:00:00Z"
    Destination="https://idp.example.com/sso"
    AssertionConsumerServiceURL="https://sp.example.com/acs">
    <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        https://sp.example.com
    </saml:Issuer>
</samlp:AuthnRequest>
```

### SAML Response

**Example:**
```xml
<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    ID="_def456"
    Version="2.0"
    IssueInstant="2024-01-01T12:00:01Z"
    Destination="https://sp.example.com/acs">
    <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        https://idp.example.com
    </saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion>
        <!-- Assertion content -->
    </saml:Assertion>
</samlp:Response>
```

---

## SAML 2.0 vs SAML 1.1

### SAML 2.0

**Features:**
- Enhanced security
- Better browser support
- More flexible
- Current standard

**Improvements:**
- Better encryption support
- Enhanced attribute handling
- Improved metadata
- More bindings

### SAML 1.1

**Features:**
- Older version
- Less flexible
- Limited browser support

### Comparison

| Feature | SAML 1.1 | SAML 2.0 |
|---------|----------|----------|
| **Standard** | Older | Current |
| **Security** | Basic | Enhanced |
| **Flexibility** | Limited | High |
| **Browser Support** | Limited | Better |
| **Adoption** | Declining | Widely used |

---

## SAML Assertions

### Assertion Structure

**Components:**
1. **Issuer**: Who issued the assertion
2. **Subject**: User identity
3. **Conditions**: Validity conditions
4. **Authentication Statement**: Authentication info
5. **Attribute Statement**: User attributes
6. **Signature**: Digital signature

### Assertion Example

```xml
<saml:Assertion
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="_assertion123"
    Version="2.0"
    IssueInstant="2024-01-01T12:00:01Z">
    <saml:Issuer>https://idp.example.com</saml:Issuer>
    <saml:Subject>
        <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
            user@example.com
        </saml:NameID>
    </saml:Subject>
    <saml:Conditions
        NotBefore="2024-01-01T12:00:00Z"
        NotOnOrAfter="2024-01-01T13:00:00Z">
        <saml:AudienceRestriction>
            <saml:Audience>https://sp.example.com</saml:Audience>
        </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AuthnStatement
        AuthnInstant="2024-01-01T12:00:00Z"
        SessionIndex="_session123">
        <saml:AuthnContext>
            <saml:AuthnContextClassRef>
                urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
            </saml:AuthnContextClassRef>
        </saml:AuthnContext>
    </saml:AuthnStatement>
    <saml:AttributeStatement>
        <saml:Attribute Name="email">
            <saml:AttributeValue>user@example.com</saml:AttributeValue>
        </saml:Attribute>
    </saml:AttributeStatement>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <!-- Digital signature -->
    </ds:Signature>
</saml:Assertion>
```

### Assertion Validation

**SP validates:**
1. **Signature**: Verify digital signature
2. **Issuer**: Verify IdP identity
3. **Conditions**: Check NotBefore, NotOnOrAfter
4. **Audience**: Verify intended recipient
5. **Replay**: Check for duplicate assertions

---

## SAML Implementation

### IdP Configuration

**Required:**
- Entity ID
- SSO endpoint
- Signing certificate
- Metadata

**Example (Keycloak):**
```xml
<EntityDescriptor entityID="https://idp.example.com">
    <IDPSSODescriptor>
        <KeyDescriptor use="signing">
            <KeyInfo>
                <X509Data>
                    <X509Certificate>...</X509Certificate>
                </X509Data>
            </KeyInfo>
        </KeyDescriptor>
        <SingleSignOnService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            Location="https://idp.example.com/sso"/>
    </IDPSSODescriptor>
</EntityDescriptor>
```

### SP Configuration

**Required:**
- Entity ID
- ACS (Assertion Consumer Service) URL
- Signing certificate (optional)
- Metadata

**Example:**
```xml
<EntityDescriptor entityID="https://sp.example.com">
    <SPSSODescriptor>
        <AssertionConsumerService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="https://sp.example.com/acs"
            index="0"/>
    </SPSSODescriptor>
</EntityDescriptor>
```

### Metadata Exchange

**Process:**
1. IdP publishes metadata
2. SP downloads IdP metadata
3. SP publishes metadata
4. IdP downloads SP metadata
5. Both configure trust relationship

---

## Câu hỏi thường gặp

### Q1: SAML là gì?

**SAML:**
- XML-based SSO protocol
- Exchanges authentication data
- Between IdP và SP
- Standard: SAML 2.0

### Q2: SAML flow?

**SP-Initiated:**
1. User → SP
2. SP → IdP (AuthnRequest)
3. IdP authenticates user
4. IdP → SP (Response với Assertion)
5. SP validates và grants access

### Q3: SAML Assertion?

**Assertion:**
- Contains authentication info
- Signed by IdP
- Includes user identity, attributes
- Has validity conditions

### Q4: SAML 2.0 vs 1.1?

**SAML 2.0:**
- Current standard
- Enhanced security
- Better browser support

**SAML 1.1:**
- Older version
- Less flexible

### Q5: SAML Bindings?

**Common bindings:**
- HTTP Redirect: GET request
- HTTP POST: POST request
- HTTP Artifact: Artifact reference
- SOAP: SOAP transport

### Q6: Assertion validation?

**SP validates:**
- Digital signature
- Issuer identity
- Conditions (time)
- Audience
- Replay protection

---

## Best Practices

1. **Use SAML 2.0**: Current standard
2. **Sign Assertions**: Always sign
3. **Encrypt Sensitive Data**: Encrypt when needed
4. **Validate Assertions**: Check all conditions
5. **Use HTTPS**: Secure transport
6. **Metadata Management**: Keep metadata updated

---

## Bài tập thực hành

### Bài 1: SAML Flow

```
Yêu cầu:
1. Design SP-initiated flow
2. Design IdP-initiated flow
3. Document SAML messages
4. Identify security considerations
```

### Bài 2: SAML Implementation

```
Yêu cầu:
1. Configure IdP
2. Configure SP
3. Exchange metadata
4. Test SSO flow
```

---

## Tổng kết

- **SAML**: XML-based SSO protocol
- **Components**: Assertions, Protocols, Bindings, Profiles
- **Flow**: SP-initiated, IdP-initiated
- **Assertions**: Authentication statements
- **SAML 2.0**: Current standard
- **Implementation**: IdP và SP configuration
