# Bài 12: Update Sets & Deployment

## Mục lục
- [1. Update Sets Overview](#1-update-sets-overview)
- [2. Tạo & Quản lý Update Sets](#2-tạo--quản-lý-update-sets)
- [3. Export & Import Update Sets](#3-export--import-update-sets)
- [4. Application Scope & Scoped Apps](#4-application-scope--scoped-apps)
- [5. Instance Strategy](#5-instance-strategy)
- [6. ATF — Automated Test Framework](#6-atf--automated-test-framework)
- [7. CI/CD cho ServiceNow](#7-cicd-cho-servicenow)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Update Sets Overview

### 1.1 Update Set là gì?

> **Update Set** = Container chứa tất cả **configuration changes** (customizations) bạn tạo, cho phép **di chuyển changes giữa instances** (DEV → TEST → PROD).

```
Update Set Concept:

DEV Instance:
┌──────────────────────────────────────┐
│ Update Set: "ITSM Customization v1"  │
│ ├── Business Rule: Set Auto-Priority │
│ ├── Client Script: Validate Form     │
│ ├── UI Policy: Mandatory Fields      │
│ ├── ACL: Restrict Delete             │
│ ├── Form Layout: Custom Fields       │
│ └── Notification: P1 Alert           │
└──────────────┬───────────────────────┘
               │ Export (XML)
               ▼
TEST Instance:
┌──────────────────────────────────────┐
│ Import → Preview → Commit            │
│                                      │
│ All changes from DEV are applied     │
└──────────────┬───────────────────────┘
               │ Export (XML)
               ▼
PROD Instance:
┌──────────────────────────────────────┐
│ Import → Preview → Commit            │
│                                      │
│ Changes now live for end users!      │
└──────────────────────────────────────┘
```

### 1.2 What gets captured?

```
✅ CAPTURED in Update Sets:
├── Business Rules
├── Client Scripts
├── UI Policies
├── UI Actions
├── Script Includes
├── ACLs
├── Form Layouts
├── Notifications
├── Scheduled Jobs
├── System Properties (some)
├── Flow Designer flows
├── Catalog Items
├── Workflows
└── Most configuration records

❌ NOT CAPTURED:
├── Data records (incidents, users, etc.)
├── Attachments (by default)
├── Report definitions (by default)
├── Dashboard configurations
├── Homepage layouts
├── Some system properties
└── Scoped Application data
```

---

## 2. Tạo & Quản lý Update Sets

### 2.1 Workflow

```
Update Set Lifecycle:

1. CREATE Update Set
   │ Name: "INC-001: P1 Auto-Assignment"
   │ Description: "Auto-assign P1 incidents to Critical Response Team"
   │ Application: Global
   │ State: In Progress
   │
2. SET as Current Update Set
   │ → Mọi changes bạn tạo sẽ vào update set này
   │
3. MAKE Changes
   │ ├── Tạo Business Rule
   │ ├── Tạo Client Script
   │ ├── Modify Form Layout
   │ └── ...
   │
4. REVIEW Changes
   │ → Mở Update Set → xem "Customer Updates" related list
   │ → Verify tất cả changes cần thiết đều có
   │
5. COMPLETE Update Set
   │ → State: Complete
   │ → Không thể thêm changes mới
   │
6. EXPORT (nếu cần chuyển instance)
```

### 2.2 Update Set Best Practices

```
Naming Convention:
├── [TICKET]-[SHORT-DESC]-v[VERSION]
├── Ví dụ: "INC-001-P1-AutoAssign-v1"
├── Ví dụ: "PROJ-123-CatalogItem-NewLaptop-v2"
└── Ví dụ: "SPRINT-5-ITSM-Enhancements-v1"

Organization:
├── 1 Update Set = 1 Feature/Story
├── KHÔNG dùng "Default" update set cho production changes
├── KHÔNG trộn nhiều features vào 1 update set
└── LUÔN review trước khi complete
```

---

## 3. Export & Import Update Sets

### 3.1 Export

```
Export Process:
1. Mở Update Set record (State = Complete)
2. Related Links: "Export to XML"
3. Save file: update_set_INC001_P1_AutoAssign_v1.xml

Alternative: Remote Update Sets
1. System Update Sets > Update Sources
2. Add target instance as source
3. Retrieve update sets remotely (không cần export file)
```

### 3.2 Import

```
Import Process:
1. Target instance: System Update Sets > Retrieved Update Sets
2. Import Update Set from XML
3. Upload file
4. Click "Preview Update Set"
   │
   ├── Preview results:
   │   ├── 🟢 No errors → safe to commit
   │   ├── 🟡 Warnings → review carefully
   │   └── 🔴 Errors → fix before commit
   │       ├── Collision: Record already customized in target
   │       ├── Missing dependency: Referenced record doesn't exist
   │       └── Scope mismatch: Different application scope
   │
5. Resolve conflicts (if any)
   │   ├── Accept remote → Use DEV version
   │   ├── Accept local → Keep target version
   │   └── Manual merge → Combine both
   │
6. Click "Commit Update Set"
   └── Changes applied to target instance ✅
```

### 3.3 Conflict Resolution

```
Conflict Types:

1. COLLISION (most common):
   Record exists in both source and target with different versions.
   
   Resolution:
   ├── Accept Remote Update: Overwrite target with source
   ├── Don't Update: Keep target version
   └── Merge: Manual code merge (for scripts)

2. MISSING RECORD:
   Update set references a record that doesn't exist in target.
   
   Resolution:
   ├── Migrate missing record first
   └── Or skip the update

3. SCOPE MISMATCH:
   Record belongs to different application scope.
   
   Resolution:
   ├── Ensure same scoped app exists in target
   └── Or change scope
```

---

## 4. Application Scope & Scoped Apps

### 4.1 Scoped Applications

```
Scoped Application = Modern way to package customizations

Advantages over Update Sets:
├── ✅ Self-contained (all related records in one scope)
├── ✅ Version control built-in
├── ✅ Source control integration (Git)
├── ✅ App Store deployment
├── ✅ Cross-instance install/uninstall
├── ✅ Better security isolation
└── ✅ Testable (ATF integration)

Creating Scoped App:
├── Filter Navigator: "Studio"
├── Or: System Applications > Studio
├── Create Application:
│   ├── Name: My ITSM Extensions
│   ├── Scope: x_mycom_itsm_ext
│   ├── Description: Custom ITSM enhancements
│   └── Version: 1.0.0
```

### 4.2 Source Control Integration

```
App Engine Studio + Source Control:

ServiceNow Instance
       │
       ▼
   Git Repository (GitHub, GitLab, Bitbucket)
       │
       ├── Branch strategy:
       │   ├── main → Production
       │   ├── develop → Development
       │   └── feature/xxx → Feature branches
       │
       └── CI/CD Pipeline:
           ├── Automated tests (ATF)
           ├── Code review
           └── Auto-deploy to instances
```

---

## 5. Instance Strategy

### 5.1 Instance Pipeline

```
Standard Instance Strategy:

┌─────┐    ┌──────┐    ┌─────────┐    ┌──────┐
│ DEV │───→│ TEST │───→│ STAGING │───→│ PROD │
└─────┘    └──────┘    └─────────┘    └──────┘
  │           │            │             │
  │ Develop   │ QA Test    │ UAT/Perf   │ Live
  │ & Unit    │ & Verify   │ Test       │ Users
  │ Test      │            │            │

Clone Strategy:
PROD → clone to → TEST (refresh data periodically)
PROD → clone to → DEV (khi cần fresh data)

Update Set Flow:
DEV → export → TEST → export → PROD
(hoặc: DEV → export → STAGING → export → PROD)
```

### 5.2 Change Freeze / Code Freeze

```
Code Freeze Periods:
├── Major holidays (no deployments)
├── Quarter-end (financial systems)
├── Upgrade periods (ServiceNow platform upgrade)
└── Major events (product launches)

During freeze:
├── No update set commits to PROD
├── Emergency changes → ECAB approval required
└── Bug fixes → case-by-case evaluation
```

---

## 6. ATF — Automated Test Framework

### 6.1 ATF Overview

> **ATF** = Built-in testing framework cho ServiceNow. Tạo automated tests cho configurations, flows, and customizations.

### 6.2 ATF Test Structure

```
ATF Test Suite: "ITSM Regression Tests"
├── Test: "P1 Incident Auto-Assignment"
│   ├── Step 1: Impersonate user "test.user"
│   ├── Step 2: Create Record → incident
│   │   ├── priority = 1
│   │   ├── short_description = "Test P1 auto-assign"
│   │   └── category = "software"
│   ├── Step 3: Assert Record Values
│   │   ├── Assert: assignment_group = "Critical Response Team"
│   │   └── Assert: state = "In Progress" (or expected value)
│   ├── Step 4: Assert Notification Sent
│   │   └── Assert: email sent to group members
│   └── Cleanup: Delete test records
│
├── Test: "Mandatory Fields on Resolve"
│   ├── Step 1: Create incident
│   ├── Step 2: Update state → Resolved
│   ├── Step 3: Assert Error → close_notes mandatory
│   └── Step 4: Fill close_notes → success
│
└── Test: "ACL - Non-ITIL Cannot Delete"
    ├── Step 1: Impersonate non-ITIL user
    ├── Step 2: Attempt delete incident
    └── Step 3: Assert delete blocked
```

### 6.3 ATF Best Practices

```
ATF Tips:
├── Run ATF suite BEFORE committing update sets
├── Include ATF tests IN your update sets/scoped apps
├── Test positive AND negative scenarios
├── Clean up test data after each test
├── Integrate ATF with CI/CD pipeline
└── Cover: Business Rules, ACLs, Flows, Client Scripts
```

---

## 7. CI/CD cho ServiceNow

### 7.1 CI/CD Pipeline

```
ServiceNow CI/CD Pipeline:

Developer
    │ Push code to Git
    ▼
┌──────────────┐
│ Git Repository│ (GitHub/GitLab)
└──────┬───────┘
       │ Trigger pipeline
       ▼
┌──────────────┐
│  CI Pipeline  │
│  ├── Install app on DEV instance
│  ├── Run ATF tests on DEV
│  ├── Code quality scan
│  └── Generate reports
└──────┬───────┘
       │ Pass? → Deploy
       ▼
┌──────────────┐
│  CD Pipeline  │
│  ├── Deploy to TEST instance
│  ├── Run ATF tests on TEST
│  ├── Deploy to PROD (manual approval)
│  └── Smoke tests on PROD
└──────────────┘

Tools:
├── ServiceNow CI/CD (built-in)
├── Jenkins + ServiceNow plugin
├── GitHub Actions + ServiceNow API
└── Azure DevOps + ServiceNow
```

---

## FAQ & Best Practices

### Q1: Update Set hay Scoped Application?
**A:**
- **Update Set**: Quick fixes, global scope changes, small teams
- **Scoped Application**: Feature development, source control, larger teams

### Q2: Preview shows errors — what to do?
**A:** 
1. **Missing references**: Migrate dependencies first
2. **Collisions**: Review and choose accept remote/local/merge
3. **Never commit with unresolved errors** on production

### Best Practices

1. **1 Feature = 1 Update Set** — don't mix
2. **Never use Default Update Set** cho real work
3. **Preview before commit** — always
4. **Backup before commit** on PROD
5. **ATF tests** trước mỗi deployment
6. **Source control** cho scoped apps
7. **Document changes** in update set description

---

## Bài tập thực hành

### Bài 1: Update Set Workflow
1. Tạo update set "Practice-ITSM-v1"
2. Set as current update set
3. Tạo 1 Business Rule, 1 Client Script, 1 UI Policy
4. Review changes trong update set
5. Complete update set
6. Export to XML

### Bài 2: ATF Basics
1. Mở Automated Test Framework
2. Tạo test: "Create Incident and Verify Priority"
3. Steps: Create incident → Assert priority calculated correctly
4. Run test → verify pass/fail

---

**Tiếp theo:** [Bài 13: Performance & Best Practices →](./13-Performance-Best-Practices.md)
