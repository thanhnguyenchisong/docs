# Bài 15: Certification Guide

## Mục lục
- [1. ServiceNow Certification Overview](#1-servicenow-certification-overview)
- [2. CSA — Certified System Administrator](#2-csa--certified-system-administrator)
- [3. CAD — Certified Application Developer](#3-cad--certified-application-developer)
- [4. CIS — Certified Implementation Specialist](#4-cis--certified-implementation-specialist)
- [5. Advanced Certifications](#5-advanced-certifications)
- [6. Exam Preparation Strategy](#6-exam-preparation-strategy)
- [7. Practice Questions](#7-practice-questions)

---

## 1. ServiceNow Certification Overview

### 1.1 Certification Hierarchy

```
ServiceNow Certification Path:

ENTRY LEVEL:
┌────────────────────────────────────────┐
│  CSA — Certified System Administrator  │ ← BẮT ĐẦU TỪ ĐÂY
│  (Required for ALL other certifications)│
└──────────────────┬─────────────────────┘
                   │
                   ├── PROFESSIONAL LEVEL:
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───┴────────────┐    ┌──────────┴──────────────┐
│  CAD            │    │  CIS (nhiều tracks)      │
│  Application    │    │  ├── CIS - ITSM           │
│  Developer      │    │  ├── CIS - HRSD           │
│                 │    │  ├── CIS - CSM            │
│  (development   │    │  ├── CIS - SecOps         │
│   focused)      │    │  ├── CIS - ITOM           │
│                 │    │  └── CIS - SAM            │
└────────────────┘    └─────────────────────────┘
                   │
                   │ EXPERT LEVEL:
                   │
         ┌─────────┴──────────┐
         │  CTA               │
         │  Certified Technical│
         │  Architect          │
         │                     │
         │  (highest level)    │
         └─────────────────────┘

Micro-Certifications:
├── Now Assist (AI)
├── Flow Designer
├── Virtual Agent
├── Performance Analytics
└── App Engine (nhiều levels)
```

### 1.2 Exam Format

```
General Exam Format:
├── Format:          Multiple choice + Multiple select
├── Questions:       55-65 questions
├── Duration:        90 minutes (CSA), 120 minutes (CAD/CIS)
├── Passing Score:   70% (varies by exam)
├── Language:        English (some translated)
├── Proctored:       Online (Pearson VUE / OnVUE)
├── Cost:            $300 USD (CSA), $300-450 (CAD/CIS)
├── Retake:          After 24 hours (if fail)
└── Validity:        Valid for current + N-1 releases
                     (need delta exam for new releases)
```

---

## 2. CSA — Certified System Administrator

### 2.1 Exam Blueprint

```
CSA Exam Domains:

Domain 1: Platform Overview & Navigation (15-20%)
├── ServiceNow platform architecture
├── UI navigation (Next Experience)
├── Lists, forms, and filters
├── Personal Developer Instance
└── Applications and modules

Domain 2: User Administration (10-15%)
├── Users, groups, roles
├── Authentication methods
├── Access controls
├── Impersonation
└── Self-service password reset

Domain 3: Tables & Columns (10-15%)
├── Table administration
├── Column types
├── Table relationships (1:N, M:N)
├── Data dictionary
└── Reference qualifiers

Domain 4: Data Management (10-15%)
├── Import sets and transform maps
├── CMDB basics
├── Data policies
├── Business rules (basics)
└── System properties

Domain 5: UI & Platform Branding (10-15%)
├── UI policies
├── UI actions
├── Client scripts (basics)
├── Form design
├── List layout
└── Menus and modules

Domain 6: Service Catalog (10-15%)
├── Catalog items
├── Record producers
├── Order guides
├── Workflows / Flows for catalog
└── Service catalog variables

Domain 7: Workflow/Flow Designer (5-10%)
├── Flow Designer basics
├── Approval workflows
├── Notifications
└── Events

Domain 8: Reporting & Dashboards (5-10%)
├── Report types (bar, pie, list, trend)
├── Dashboard creation
├── Scheduled reports
└── Performance Analytics (basics)

Domain 9: Knowledge Management (5-10%)
├── Knowledge bases
├── Article lifecycle
├── Knowledge search
└── Integration with ITSM

Domain 10: Instance Management (5-10%)
├── Update sets
├── Cloning
├── Plugin management
└── Instance configuration
```

### 2.2 CSA Study Guide

```
CSA Study Plan (4-6 weeks):

Week 1-2: Platform Fundamentals
├── Bài 01: ServiceNow Fundamentals
├── Bài 02: Platform Administration
├── Now Learning: "ServiceNow Fundamentals" course
└── PDI Practice: Navigate, create records, configure

Week 3: ITSM & Data
├── Bài 03: ITSM (Incident, Problem, Change)
├── Bài 04: CMDB basics
├── Now Learning: data management modules
└── PDI Practice: ITSM workflows, import sets

Week 4: Development Basics
├── Bài 05: Scripting (GlideRecord basics)
├── Bài 06: Business Rules & Client Scripts (basics)
├── Now Learning: scripting fundamentals
└── PDI Practice: Create BR, CS, UI Policy

Week 5: Advanced Admin & Service Catalog
├── Bài 07: Flow Designer
├── Bài 08: Service Portal
├── Bài 12: Update Sets
└── PDI Practice: Create catalog items, update sets

Week 6: Review & Practice Exams
├── Review weak areas
├── Take practice exams
├── ServiceNow community forums
└── Timed practice tests
```

---

## 3. CAD — Certified Application Developer

### 3.1 Exam Blueprint

```
CAD Exam Domains:

Domain 1: Application Development (20-25%)
├── Application scope
├── Studio / App Engine Studio
├── Table design
├── Form design
└── Guided app creation

Domain 2: Scripting (25-30%) ← TRỌNG TÂM
├── GlideRecord (query, insert, update, delete)
├── GlideSystem
├── GlideAjax
├── GlideAggregate
├── GlideDateTime
├── Server-side vs Client-side
├── Scoped APIs
└── Script Includes

Domain 3: Client-side Development (15-20%)
├── Client Scripts (all types)
├── UI Policies
├── UI Actions
├── Catalog client scripts
└── g_form, g_user, g_list APIs

Domain 4: Server-side Development (15-20%)
├── Business Rules
├── Script Includes
├── Scheduled Jobs
├── Fix Scripts
├── Email scripts
└── Transform scripts

Domain 5: Workflows & Integration (10-15%)
├── Flow Designer
├── Subflows
├── REST API
├── Scripted REST
├── Web services
└── IntegrationHub basics

Domain 6: Security & Testing (5-10%)
├── ACLs
├── Data policies
├── ATF (Automated Test Framework)
├── Debugging
└── Instance Scan
```

### 3.2 CAD Study Guide

```
CAD Study Plan (6-8 weeks):

Week 1-2: Scripting Mastery
├── Bài 05: ServiceNow Scripting (GlideRecord, gs, etc.)
├── Practice coding exercises trên PDI
├── Master: query, insert, update, delete
└── Master: GlideAggregate, GlideDateTime

Week 3-4: Client & Server Development  
├── Bài 06: Business Rules & Client Scripts
├── Practice: BR (before/after/async)
├── Practice: CS (onLoad/onChange/onSubmit)
├── Practice: Script Includes
└── Master: g_form, g_user APIs

Week 5-6: Automation & Integration
├── Bài 07: Flow Designer
├── Bài 09: Integration & REST API
├── Practice: Scripted REST APIs
├── Practice: GlideAjax patterns
└── Practice: Import Sets

Week 7-8: Security, Testing & Review
├── ACLs, Data Policies
├── ATF test creation
├── Debugging techniques
├── Practice exams
└── Review weak areas
```

---

## 4. CIS — Certified Implementation Specialist

### 4.1 CIS Tracks

```
CIS Tracks (pick based on career/project):

CIS-ITSM (IT Service Management):
├── Incident, Problem, Change, Request management
├── Knowledge, SLA management
├── Service Catalog configuration
├── Walk-up Experience
└── Agent Workspace

CIS-HRSD (HR Service Delivery):
├── HR case management
├── HR service portal
├── Employee lifecycle events
├── HR knowledge management
└── HR analytics

CIS-CSM (Customer Service Management):
├── Customer service cases
├── Customer portal
├── Agent workspace for CSM
├── Proactive service
└── Customer asset management

CIS-ITOM (IT Operations Management):
├── Discovery configuration
├── Service Mapping
├── Event Management
├── Cloud Management
└── CMDB/CSDM

CIS-SecOps (Security Operations):
├── Security Incident Response
├── Vulnerability Response
├── Threat Intelligence
└── Configuration Compliance
```

---

## 5. Advanced Certifications

### 5.1 CTA — Certified Technical Architect

```
CTA = Highest ServiceNow certification

Prerequisites:
├── CSA (active)
├── At least 1 CIS or CAD (active)
├── 5+ years ServiceNow experience
└── Deep expertise in platform

Exam Format:
├── Multi-day assessment
├── Live scenario-based evaluation
├── Architecture design review
├── Presentation to review board
└── Extremely challenging (~10% pass rate)
```

### 5.2 Micro-Certifications

```
Micro-Certifications (free or low-cost):
├── Flow Designer Micro-Certification
├── Performance Analytics Micro-Certification
├── Virtual Agent Micro-Certification
├── Now Assist (AI) Micro-Certification
├── App Engine (multiple levels)
├── CMDB Health Micro-Certification
└── Service Operations Workspace Micro-Certification

→ Free on Now Learning
→ Quick to earn (few hours study)
→ Looks good on resume
```

---

## 6. Exam Preparation Strategy

### 6.1 Study Resources

```
Official Resources:
├── Now Learning (nowlearning.servicenow.com)
│   ├── Free courses
│   ├── Exam prep materials
│   └── Career journeys
│
├── ServiceNow Documentation (docs.servicenow.com)
│   └── Reference for all features
│
├── ServiceNow Developer (developer.servicenow.com)
│   ├── PDI (Personal Developer Instance)
│   ├── Code examples
│   └── Developer blog
│
└── ServiceNow Community (community.servicenow.com)
    ├── Forums
    ├── Blogs
    └── Events

Unofficial Resources:
├── YouTube channels (ServiceNow tutorials)
├── Udemy courses
├── Practice exam sites
└── Study groups / Discord
```

### 6.2 Exam Day Tips

```
Before Exam:
├── Sleep well the night before
├── Review key concepts (not new material)
├── Have snacks & water ready (online exam)
├── Test your computer/webcam/internet

During Exam:
├── Read questions carefully — look for keywords
├── Eliminate obviously wrong answers first
├── Flag uncertain questions — come back later
├── Don't spend >2 minutes on any single question
├── Watch for "MOST", "LEAST", "BEST", "NOT" keywords
└── "All of the above" is often correct

Common Traps:
├── "Which is the BEST approach?" → follow best practices
├── "What is NOT possible?" → double negative trap
├── Answers that are "technically correct but not best practice"
└── Options that mix Server-side and Client-side concepts
```

---

## 7. Practice Questions

### 7.1 CSA Practice Questions

```
Q1: Which table is the base class for Incident, Problem, and Change?
A) sys_metadata
B) task ✅
C) cmdb_ci
D) sys_audit

Q2: What is the default behavior if no ACL rules exist for a table?
A) All users can access
B) Only admin can access ✅
C) Error is thrown
D) Table is hidden

Q3: Where should you NEVER use GlideRecord?
A) Business Rules
B) Script Includes
C) Client Scripts ✅
D) Scheduled Jobs

Q4: What is the correct order for Update Set deployment?
A) DEV → PROD → TEST
B) TEST → DEV → PROD
C) DEV → TEST → PROD ✅
D) PROD → DEV → TEST

Q5: What is the priority calculation in ServiceNow?
A) Priority = Impact + Urgency
B) Priority = Impact × Urgency (matrix lookup) ✅
C) Priority = Impact - Urgency
D) Priority is manually set

Q6: Which Business Rule type should you use for field calculations 
    that need to happen BEFORE the record is saved?
A) After
B) Before ✅
C) Async
D) Display

Q7: What happens when you call current.update() inside a Before 
    Business Rule?
A) Nothing special
B) Record is saved twice
C) It may cause an infinite loop ✅
D) It improves performance

Q8: What is the recommended way for a Client Script to retrieve 
    server-side data?
A) GlideRecord on the client
B) g_form.getReference()
C) GlideAjax ✅
D) Direct database query

Q9: In ITIL, what is the PRIMARY goal of Incident Management?
A) Find the root cause
B) Restore service as quickly as possible ✅
C) Prevent incidents from recurring
D) Document all issues

Q10: What is the purpose of a Transform Map?
A) Transform UI appearance
B) Map source columns to target table fields ✅
C) Transform scripts to flows
D) Map CI relationships
```

### 7.2 CAD Practice Questions

```
Q1: Which GlideRecord method should you use to count records 
    efficiently?
A) gr.getRowCount()
B) GlideAggregate with COUNT ✅
C) Loop and increment counter
D) gr.getTotal()

Q2: In a Scoped Application, which API is NOT available?
A) GlideRecord
B) gs.sleep() ✅
C) GlideSystem (gs)
D) GlideAggregate

Q3: What is the purpose of AbstractAjaxProcessor?
A) Process SOAP requests
B) Enable Script Include to be called from Client Scripts ✅
C) Process REST API requests
D) Handle async operations

Q4: Which method should you use to prevent a record from being saved 
    in a Before Business Rule?
A) current.abort()
B) current.setAbortAction(true) ✅
C) return false
D) gs.cancel()

Q5: What does current.state.changes() check in a Business Rule?
A) If the state field exists
B) If the state field value has changed ✅
C) If the state field is empty
D) If the state field is writable
```

---

## Study Checklist

### CSA Exam Ready?
- [ ] Hiểu ServiceNow architecture
- [ ] Navigate UI thành thạo
- [ ] Quản lý Users, Groups, Roles
- [ ] Cấu hình ACLs
- [ ] ITSM processes (Incident, Problem, Change)
- [ ] Service Catalog & Request Management
- [ ] Knowledge Management
- [ ] Import Sets & Transform Maps
- [ ] Update Sets workflow
- [ ] UI Policies & Client Scripts (basics)
- [ ] Business Rules (basics)
- [ ] Flow Designer (basics)
- [ ] Reporting & Dashboards
- [ ] Notifications & Events
- [ ] ✅ Taken ≥ 3 practice exams with ≥ 80% score

### CAD Exam Ready?
- [ ] All CSA knowledge ✅
- [ ] GlideRecord CRUD fluent
- [ ] GlideAjax pattern mastered
- [ ] GlideAggregate usage
- [ ] Business Rules (all types)
- [ ] Client Scripts (all types)
- [ ] Script Includes (standard + client callable)
- [ ] UI Policies & UI Actions
- [ ] Scoped Applications
- [ ] REST API (Table API + Scripted REST)
- [ ] Flow Designer advanced
- [ ] ACLs & Security
- [ ] ATF test creation
- [ ] Debugging techniques
- [ ] ✅ Built ≥ 2 custom applications on PDI

---

## Tài liệu tham khảo

- [Now Learning](https://nowlearning.servicenow.com/) — Official courses & exam prep
- [ServiceNow Certification](https://www.servicenow.com/services/training-and-certification.html) — Exam registration
- [ServiceNow Developer](https://developer.servicenow.com/) — PDI & developer resources
- [ServiceNow Docs](https://docs.servicenow.com/) — Official documentation
- [ServiceNow Community](https://www.servicenow.com/community/) — Forums & discussions

---

**🎉 Chúc bạn thành công trên con đường trở thành ServiceNow IT Professional!**

**Quay lại:** [← README](./README.md)
