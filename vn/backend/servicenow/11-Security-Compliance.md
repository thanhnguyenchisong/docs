# Bài 11: Security & Compliance

## Mục lục
- [1. Security Overview](#1-security-overview)
- [2. LDAP & Active Directory Integration](#2-ldap--active-directory-integration)
- [3. SSO (Single Sign-On)](#3-sso-single-sign-on)
- [4. Multi-Factor Authentication (MFA)](#4-multi-factor-authentication-mfa)
- [5. Data Encryption & Privacy](#5-data-encryption--privacy)
- [6. Security Operations (SecOps)](#6-security-operations-secops)
- [7. Audit & Compliance](#7-audit--compliance)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Security Overview

### 1.1 Security Layers trong ServiceNow

```
ServiceNow Security Onion:

┌─────────────────────────────────────────────┐
│  Layer 1: NETWORK SECURITY                   │
│  ├── IP Access Control (whitelist)           │
│  ├── TLS/SSL encryption (in transit)         │
│  └── Instance firewall rules                 │
├─────────────────────────────────────────────┤
│  Layer 2: AUTHENTICATION                     │
│  ├── Local auth (username/password)          │
│  ├── LDAP/AD integration                     │
│  ├── SSO (SAML 2.0, OIDC)                  │
│  └── MFA (Multi-Factor Authentication)       │
├─────────────────────────────────────────────┤
│  Layer 3: AUTHORIZATION                      │
│  ├── Roles (admin, itil, etc.)              │
│  ├── ACLs (table/record/field level)         │
│  ├── Data Policies                           │
│  └── Domain Separation                       │
├─────────────────────────────────────────────┤
│  Layer 4: DATA SECURITY                      │
│  ├── Encryption (at rest)                    │
│  ├── Column-level encryption                 │
│  ├── Edge Encryption                         │
│  └── Data masking                            │
├─────────────────────────────────────────────┤
│  Layer 5: AUDIT & COMPLIANCE                 │
│  ├── Audit logs                              │
│  ├── Activity logs                           │
│  ├── Session logs                            │
│  └── Compliance dashboards                   │
└─────────────────────────────────────────────┘
```

---

## 2. LDAP & Active Directory Integration

### 2.1 LDAP Integration Overview

```
LDAP Integration cho phép:
├── User Provisioning → Tự động tạo/update users từ Active Directory
├── Group Sync → Sync AD groups → ServiceNow groups
├── Authentication → Users login bằng AD credentials
└── Scheduled Sync → Tự động sync hàng ngày/hàng giờ

Architecture:
┌──────────┐    LDAP/LDAPS     ┌────────────┐
│ServiceNow│ ←─────────────── │ MID Server │
│ Instance │        │          └──────┬─────┘
└──────────┘        │                 │ LDAP
                    │          ┌──────┴─────┐
                    │          │ Active     │
                    │          │ Directory  │
                    │          └────────────┘
                    └── Port 636 (LDAPS) or 389 (LDAP)
```

### 2.2 LDAP Configuration

```
LDAP Server:
├── Name:           Corporate Active Directory
├── Server URL:     ldaps://dc01.company.local:636
├── MID Server:     MID-Server-DC1
├── Login DN:       CN=svc_servicenow,OU=Service Accounts,DC=company,DC=local
├── Password:       ****

LDAP OU Definitions:
├── OU 1: Users
│   ├── Base DN:        OU=Users,DC=company,DC=local
│   ├── Target Table:   sys_user
│   ├── Filter:         (&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))
│   └── Field Mappings:
│       ├── sAMAccountName → user_name
│       ├── givenName → first_name
│       ├── sn → last_name
│       ├── mail → email
│       ├── telephoneNumber → phone
│       ├── department → department
│       ├── title → title
│       └── manager → manager (DN lookup)
│
└── OU 2: Groups
    ├── Base DN:        OU=Groups,DC=company,DC=local
    ├── Target Table:   sys_user_group
    └── Field Mappings:
        ├── cn → name
        ├── description → description
        └── member → (member sync)

Schedule: Daily at 01:00 AM
```

---

## 3. SSO (Single Sign-On)

### 3.1 SSO Protocols

| Protocol | Mô tả | Use Case |
|----------|--------|----------|
| **SAML 2.0** | XML-based, enterprise standard | Azure AD, ADFS, Okta |
| **OIDC** | Modern, JSON-based (OAuth 2.0) | Azure AD, Google, Auth0 |
| **OAuth 2.0** | Authorization framework | API access |

### 3.2 SAML SSO Flow

```
SAML 2.0 SSO Flow (SP-initiated):

User ──→ ServiceNow (SP)
              │
              │ User not authenticated
              │ Redirect to IdP
              ▼
         Identity Provider (IdP)
         (Azure AD / Okta / ADFS)
              │
              │ User logs in with
              │ corporate credentials
              │ (+ MFA if configured)
              ▼
         IdP validates credentials
              │
              │ SAML Assertion
              │ (signed XML document)
              │ Contains: username, email,
              │ roles, groups
              ▼
         ServiceNow (SP)
              │
              │ Validates SAML signature
              │ Maps user → sys_user
              │ Creates session
              ▼
         User logged in! ✅
```

### 3.3 Multi-Provider SSO Configuration

```
Multi-Provider SSO:
├── Cho phép nhiều IdP cùng lúc
├── Users from different organizations
├── Example:
│   ├── IdP 1: Azure AD (internal employees)
│   ├── IdP 2: Okta (contractors)
│   └── IdP 3: Google Workspace (partners)

Configuration:
├── Filter Navigator: "Multi-Provider SSO > Identity Providers"
├── Create IdP record:
│   ├── Name:           Azure AD SSO
│   ├── Protocol:       SAML 2.0
│   ├── IdP URL:        https://login.microsoftonline.com/.../saml2
│   ├── Certificate:    (IdP signing certificate)
│   ├── Name ID Policy: urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
│   ├── User Field:     email (field to match in sys_user)
│   └── Active:         ✅
```

---

## 4. Multi-Factor Authentication (MFA)

### 4.1 MFA Options

```
ServiceNow MFA:
├── Built-in MFA:
│   ├── Email OTP → Code sent via email
│   └── SMS OTP → Code sent via SMS
│
├── Third-party MFA (via SSO):
│   ├── Microsoft Authenticator
│   ├── Google Authenticator
│   ├── Duo Security
│   ├── Okta Verify
│   └── RSA SecurID
│
└── MFA Policies:
    ├── Required for: admin, security_admin roles
    ├── Optional for: itil users
    ├── Skip for: service accounts (API-only)
    └── Conditional: Required when outside VPN
```

---

## 5. Data Encryption & Privacy

### 5.1 Encryption Types

```
Encryption in ServiceNow:

1. In Transit:
   └── TLS 1.2+ (HTTPS) → Mọi traffic đều encrypted

2. At Rest:
   └── AES-256 → Database encryption (managed by ServiceNow)

3. Column-level Encryption:
   ├── Encrypt specific fields (SSN, credit card, etc.)
   ├── Controlled by encryption context
   └── Only authorized users can decrypt

4. Edge Encryption:
   ├── Data encrypted BEFORE leaving customer network
   ├── Proxy on MID Server
   ├── ServiceNow CANNOT read encrypted data
   └── Customer holds encryption keys
```

### 5.2 Edge Encryption

```
Edge Encryption Flow:

User types: "SSN: 123-45-6789"
        │
        ▼
┌───────────────┐
│  Edge Proxy    │ → Encrypt: "SSN: ****-**-****" (stored in SN)
│  (MID Server)  │ → Key stays with customer
└───────────────┘
        │
        ▼
┌───────────────┐
│  ServiceNow   │ → Stores encrypted value
│  Instance      │ → Cannot decrypt without key
└───────────────┘
        │
        ▼ (when user views)
┌───────────────┐
│  Edge Proxy    │ → Decrypt for authorized user
│  (MID Server)  │ → "SSN: 123-45-6789"
└───────────────┘
```

---

## 6. Security Operations (SecOps)

### 6.1 SecOps Modules

```
Security Operations:
├── Vulnerability Response
│   ├── Import vulnerabilities từ scanning tools
│   │   (Qualys, Tenable, Rapid7)
│   ├── Link vulnerabilities → CMDB CIs
│   ├── Prioritize by business impact
│   └── Track remediation workflow
│
├── Security Incident Response (SIR)
│   ├── Import security events từ SIEM
│   │   (Splunk, QRadar, Sentinel)
│   ├── Investigate security incidents
│   ├── Orchestrate response (playbooks)
│   └── Track containment & remediation
│
├── Threat Intelligence
│   ├── Ingest threat feeds
│   ├── Correlate with internal data
│   └── Proactive threat hunting
│
└── Configuration Compliance
    ├── Define compliance policies
    ├── Scan CIs against policies
    └── Track remediation
```

---

## 7. Audit & Compliance

### 7.1 Audit Logs

```
ServiceNow Audit:
├── Record History: Xem lịch sử thay đổi mỗi record
│   └── Right-click record > History
│
├── System Logs: 
│   ├── System Log > All (syslog)
│   ├── System Log > Script Log Statements
│   └── System Log > Errors
│
├── Transaction Logs:
│   └── System Logs > Transactions (performance)
│
├── Login Logs:
│   └── User Administration > Login History (sysparm_login_history)
│
└── Security Audit:
    └── System Diagnostics > Session Log
```

### 7.2 GRC (Governance, Risk & Compliance)

```
GRC Module:
├── Policy & Compliance
│   ├── Define policies (IT Security, Data Privacy)
│   ├── Map policies to controls
│   └── Assess compliance levels
│
├── Risk Management
│   ├── Risk register
│   ├── Risk assessment
│   └── Risk treatment plans
│
└── Audit Management
    ├── Audit planning
    ├── Audit execution
    └── Finding tracking
```

---

## FAQ & Best Practices

### Q1: LDAP vs SSO — sự khác biệt?
**A:**
- **LDAP**: Sync user data (provision) + có thể authenticate
- **SSO**: Authentication only (redirect to IdP)
- **Best practice**: LDAP cho data sync + SSO cho authentication

### Q2: Edge Encryption có ảnh hưởng performance?
**A:** Có (chút ít) — encrypt/decrypt qua MID Server proxy. Chỉ dùng cho sensitive fields.

### Best Practices

1. **SSO + MFA** cho tất cả user (đặc biệt admin)
2. **LDAP scheduled sync** để giữ user data fresh
3. **Principle of least privilege** cho roles/ACLs
4. **Audit regularly** — review login logs, access patterns
5. **Edge Encryption** cho PII/sensitive data
6. **Separate Integration Users** cho API access

---

## Bài tập thực hành

### Bài 1: Security Review
1. Xem ACL list: `sys_security_acl.list`
2. Xem Login History: `sysparm_login_history.list`
3. Review roles assigned to admin group
4. Check system properties for password policy

### Bài 2: Audit
1. Tạo incident → update nhiều lần
2. Xem Record History (right-click > History)
3. Xem System Logs cho script log statements
4. Review Security audit log

---

**Tiếp theo:** [Bài 12: Update Sets & Deployment →](./12-Update-Sets-Deployment.md)
