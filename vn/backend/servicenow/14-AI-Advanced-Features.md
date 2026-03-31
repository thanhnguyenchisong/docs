# Bài 14: AI & Advanced Features

## Mục lục
- [1. Now Assist (GenAI)](#1-now-assist-genai)
- [2. Predictive Intelligence](#2-predictive-intelligence)
- [3. Virtual Agent](#3-virtual-agent)
- [4. Performance Analytics](#4-performance-analytics)
- [5. App Engine Studio](#5-app-engine-studio)
- [6. Domain Separation](#6-domain-separation)
- [FAQ & Best Practices](#faq--best-practices)

---

## 1. Now Assist (GenAI)

### 1.1 Now Assist là gì?

> **Now Assist** = ServiceNow's GenAI (Generative AI) integrated directly into the platform. Dùng Large Language Models để assist users, agents, và developers.

### 1.2 Now Assist Features

```
Now Assist Capabilities:

For AGENTS (ITSM):
├── Case/Incident Summarization
│   └── AI tóm tắt incident history → agent hiểu nhanh
├── Resolution Recommendations
│   └── Suggest solutions dựa trên similar past incidents
├── Work Notes Generation
│   └── AI viết work notes từ chat/voice interactions
└── Knowledge Article Generation
    └── Auto-generate KB articles từ resolved incidents

For END USERS:
├── Virtual Agent (AI chatbot)
│   └── Natural language conversations
├── Search Enhancement
│   └── Semantic search thay vì keyword search
└── Self-Service Suggestions
    └── Recommend catalog items/KB articles

For DEVELOPERS:
├── Code Generation
│   └── Generate Business Rules, Client Scripts từ mô tả
├── Flow Generation
│   └── Generate Flow Designer flows từ mô tả
├── Code Explanation
│   └── Explain existing scripts
└── Test Generation
    └── Generate ATF test cases
```

### 1.3 Now Assist Examples

```
Agent Summarization Example:

Input: Incident INC0050001 with 15 work notes, 3 state changes

Now Assist Summary:
"Customer John reported email delivery delays starting March 30 at 9 AM.
Initial investigation by L1 revealed SMTP queue backlog on mail server 
MAIL-01. L2 identified a DNS resolution issue affecting outbound mail relay.
DNS record was corrected at 2 PM, and email delivery resumed normally.
Resolution time: 5 hours. Root cause: stale DNS cache for mail relay."

---

Code Generation Example:

Prompt: "Create a business rule that prevents closing a P1 incident 
without a problem record linked"

Generated Code:
(function executeRule(current, previous) {
    if (current.state.changesTo(7)) {  // Closing
        var prob = new GlideRecord('problem');
        prob.addQuery('related_incidents', 'CONTAINS', current.getUniqueValue());
        prob.query();
        if (!prob.hasNext()) {
            current.setAbortAction(true);
            gs.addErrorMessage('P1 incidents must have a linked Problem record before closing.');
        }
    }
})(current, previous);
```

---

## 2. Predictive Intelligence

### 2.1 Overview

```
Predictive Intelligence = ML models trained on YOUR data

Features:
├── Classification
│   ├── Auto-categorize incidents (category, subcategory)
│   ├── Auto-assign to groups
│   └── Auto-set priority
│
├── Similarity
│   ├── Find similar incidents
│   ├── Suggest resolutions from past cases
│   └── Identify duplicate incidents
│
├── Regression
│   └── Predict values (resolution time, effort)
│
└── Clustering
    ├── Group similar incidents
    └── Identify trends/patterns

How it works:
1. Define ML Solution (table, fields, target)
2. Train model (using historical data)
3. Evaluate accuracy
4. Deploy to production
5. Model predicts in real-time
```

### 2.2 Example: Auto-Classification

```
ML Solution: "Incident Category Classification"

Training Data:
├── Input: short_description, description
├── Target: category, subcategory
├── Historical: 50,000 closed incidents

Result:
├── New Incident: "Cannot access Office 365 email"
├── ML Prediction:
│   ├── Category: Software (95% confidence)
│   ├── Subcategory: Email (92% confidence)
│   └── Assignment Group: Email Support (88% confidence)
├── Agent can accept/override prediction
└── Model learns from corrections
```

---

## 3. Virtual Agent

### 3.1 Virtual Agent Overview

```
Virtual Agent = AI-powered chatbot

Channels:
├── Service Portal (web chat)
├── Microsoft Teams
├── Slack
├── Mobile app
└── Custom channels

Capabilities:
├── Natural Language Understanding (NLU)
├── Intent recognition
├── Entity extraction
├── Multi-turn conversations
├── Backend actions (create ticket, lookup info)
├── Transfer to live agent
└── Multi-language support
```

### 3.2 Topic Design

```
Virtual Agent Topic: "Password Reset"

User: "I forgot my password"
Bot:  "I can help you reset your password. Which account?"
  → Options: [Email] [VPN] [Company Portal] [Other]

User: clicks [Email]
Bot:  "I'll initiate a password reset for your email account."
Bot:  "Please verify your employee ID."

User: "EMP12345"
Bot:  → [Backend: verify employee ID]
Bot:  "Verified! I'm sending a reset link to your registered phone."
Bot:  → [Backend: trigger password reset flow]
Bot:  "Password reset link sent! Check your phone."
Bot:  "Is there anything else I can help with?"

User: "No, thanks"
Bot:  "Great! Have a nice day! 😊"
Bot:  → [Backend: close or log interaction]
```

---

## 4. Performance Analytics

### 4.1 Overview

```
Performance Analytics = Advanced reporting & dashboarding

Features:
├── KPI Indicators      → Track metrics over time
├── Breakdowns          → Slice data by dimensions
├── Scorecards          → Visual KPI tracking
├── Dashboards          → Executive & operational views
├── Automated Reports   → Scheduled email reports
└── Benchmarking        → Compare against goals

Common ITSM KPIs:
├── MTTR (Mean Time To Resolve)
├── MTBF (Mean Time Between Failures)
├── First Call Resolution Rate
├── SLA Achievement Rate
├── Incident Volume by Category
├── Change Success Rate
├── Customer Satisfaction (CSAT)
└── Agent Utilization
```

### 4.2 Dashboard Example

```
IT Service Management Dashboard:

┌──────────────────────────────────────────────────┐
│ ITSM Executive Dashboard                         │
│                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ Open     │ │ P1 Active│ │ SLA %    │          │
│ │ Incidents│ │          │ │          │          │
│ │   245    │ │    3     │ │  94.2%   │          │
│ └──────────┘ └──────────┘ └──────────┘          │
│                                                   │
│ ┌─────────────────────┐ ┌───────────────────┐    │
│ │ Incidents by Priority│ │ Trend (30 days)   │    │
│ │ P1: ██ 3            │ │ ▁▂▃▂▁▂▃▄▃▂▁▂▃    │    │
│ │ P2: ████ 15         │ │                   │    │
│ │ P3: ████████ 120    │ │ Avg: 45/day       │    │
│ │ P4: █████ 107       │ │ Peak: 62          │    │
│ └─────────────────────┘ └───────────────────┘    │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ MTTR by Category                            │  │
│ │ Hardware:  ████████████████ 12h              │  │
│ │ Software:  ████████████ 8h                   │  │
│ │ Network:   ██████████████████ 16h            │  │
│ │ Email:     ██████ 4h                         │  │
│ └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 5. App Engine Studio

### 5.1 Overview

```
App Engine Studio = Low-code development environment

Features:
├── Visual app builder
├── Drag-and-drop UI components
├── Data model designer
├── Process automation
├── Integration builder
├── Guided App Creator
├── Citizen development (non-IT users)
└── Built-in governance

Use Cases:
├── Custom department apps (HR, Finance, Legal)
├── Project tracking tools
├── Approval workflows
├── Data collection forms
└── Internal tools
```

### 5.2 Building an App

```
App Building Process:

1. CREATE App
   ├── Name, Description, Scope
   └── Choose template or blank

2. DATA MODEL
   ├── Create tables
   ├── Define fields
   └── Set relationships

3. FORMS & PAGES
   ├── Design forms using UI Builder
   ├── Create pages for different views
   └── Add widgets and components

4. LOGIC & AUTOMATION
   ├── Business Rules
   ├── Flows (Flow Designer)
   ├── Client Scripts
   └── Security (ACLs)

5. EXPERIENCE
   ├── Workspace (agent view)
   ├── Portal (user view)
   └── Mobile (native app)

6. TEST & DEPLOY
   ├── ATF tests
   ├── Deploy to target instances
   └── Publish to App Store (optional)
```

---

## 6. Domain Separation

### 6.1 Overview

```
Domain Separation = Multi-tenant within single instance

Use Cases:
├── MSP (Managed Service Provider) → multiple customers on 1 instance
├── Large enterprise → different business units separated
└── Government → different agencies

Features:
├── Data isolation between domains
├── Process isolation
├── Configuration isolation
├── Reporting separation
├── Admin delegation per domain
└── Shared services (optional)

Architecture:
┌─────────────────────────────────────────┐
│            TOP Domain                    │
│    (shared config & admin)               │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Domain A     │  │ Domain B     │     │
│  │ (Company A)  │  │ (Company B)  │     │
│  │              │  │              │     │
│  │ Users: 500   │  │ Users: 300   │     │
│  │ CIs: 2000    │  │ CIs: 1500   │     │
│  │ Incidents    │  │ Incidents    │     │
│  └──────────────┘  └──────────────┘     │
│                                          │
│  Data from Domain A NOT visible          │
│  to Domain B users (and vice versa)      │
└─────────────────────────────────────────┘
```

---

## FAQ & Best Practices

### Q1: Now Assist có mất phí thêm không?
**A:** **Có.** Now Assist là add-on license riêng, không included trong standard ITSM license.

### Q2: Predictive Intelligence cần bao nhiêu data?
**A:** Minimum ~5,000-10,000 historical records cho accuracy tốt. Càng nhiều data → model càng chính xác.

### Q3: Virtual Agent vs Now Assist — khác gì?
**A:**
- **Virtual Agent**: Rule-based chatbot với NLU
- **Now Assist**: GenAI integration xuyên suốt platform (trong VA, Agent Workspace, Developer tools, etc.)

### Best Practices

1. **Start with OOB AI** trước khi custom
2. **Quality data** = quality predictions
3. **Monitor model accuracy** regularly
4. **Human-in-the-loop** — AI suggests, human decides
5. **Train models** on recent, clean data

---

**Tiếp theo:** [Bài 15: Certification Guide →](./15-Certification-Guide.md)
