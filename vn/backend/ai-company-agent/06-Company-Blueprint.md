# Bài 6: IT Company Agent Blueprint

## Mục lục
- [1. Company Overview](#1-company-overview)
- [2. Agent Roster — 12 Agents](#2-agent-roster--12-agents)
- [3. Agent Profiles chi tiết](#3-agent-profiles-chi-tiết)
- [4. Communication Flows](#4-communication-flows)
- [5. Decision Authority Matrix](#5-decision-authority-matrix)
- [6. End-to-End Workflows](#6-end-to-end-workflows)
- [7. Escalation & Fallback](#7-escalation--fallback)
- [8. Cost Optimization](#8-cost-optimization)

---

## 1. Company Overview

### 1.1 Cấu trúc IT Company

```
╔═══════════════════════════════════════════════════════════════╗
║                 🏢 AI TECH COMPANY                           ║
║                                                               ║
║  Mission: Tự động hóa SDLC từ requirement → deployment       ║
║                                                               ║
║  ┌─────────────────── EXECUTIVE ──────────────────────┐      ║
║  │                                                     │      ║
║  │  👔 CEO Agent        📊 CTO Agent                  │      ║
║  │  Strategy & Final    Technical Direction            │      ║
║  │  Decisions            Architecture                  │      ║
║  │                                                     │      ║
║  └──────────────────────┬──────────────────────────────┘      ║
║                          │                                     ║
║  ┌───────────────────────┼──────────────────────────┐         ║
║  │              MANAGEMENT LAYER                     │         ║
║  │                                                   │         ║
║  │  📋 PM Agent          🎨 Designer Agent           │         ║
║  │  Project Management   UI/UX Design                │         ║
║  └───────────────────────┼──────────────────────────┘         ║
║                          │                                     ║
║  ┌───────────────────────┼──────────────────────────┐         ║
║  │              ENGINEERING LAYER                    │         ║
║  │                                                   │         ║
║  │  💻 Backend Dev    🖥️ Frontend Dev    🧪 QA       │         ║
║  │  🏗️ DevOps        🔒 Security        📝 Docs     │         ║
║  └───────────────────────┼──────────────────────────┘         ║
║                          │                                     ║
║  ┌───────────────────────┼──────────────────────────┐         ║
║  │              OPERATIONS LAYER                     │         ║
║  │                                                   │         ║
║  │  🤖 Support Agent      📈 Analytics Agent        │         ║
║  └──────────────────────────────────────────────────┘         ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 2. Agent Roster — 12 Agents

### 2.1 Full Roster

| # | Agent | Role | LLM Tier | Authority Level |
|---|-------|------|----------|----------------|
| 1 | 👔 CEO Agent | Strategic decisions, final approval | GPT-4o | Executive |
| 2 | 📊 CTO Agent | Tech architecture, tech decisions | GPT-4o | Executive |
| 3 | 📋 PM Agent | Project planning, task assignment | GPT-4o | Management |
| 4 | 🎨 Designer Agent | UI/UX design, prototypes | GPT-4o | Management |
| 5 | 💻 Backend Dev Agent | Server-side code, APIs, DB | GPT-4o | Engineering |
| 6 | 🖥️ Frontend Dev Agent | UI implementation, client code | GPT-4o | Engineering |
| 7 | 🧪 QA Agent | Testing, code review, quality | GPT-4o | Engineering |
| 8 | 🏗️ DevOps Agent | CI/CD, infrastructure, deploy | GPT-4o-mini | Engineering |
| 9 | 🔒 Security Agent | Security audit, compliance | GPT-4o | Engineering |
| 10 | 📝 Documentation Agent | Docs, API specs, guides | GPT-4o-mini | Engineering |
| 11 | 🤖 Support Agent | Customer issues, triage | GPT-4o-mini | Operations |
| 12 | 📈 Analytics Agent | Metrics, reports, insights | GPT-4o-mini | Operations |

---

## 3. Agent Profiles chi tiết

### 3.1 CEO Agent

```python
CEO_AGENT = {
    "name": "CEO Agent",
    "role": "Chief Executive Officer",
    "llm": "gpt-4o",
    
    "system_prompt": """
    You are the CEO of an AI-powered IT company.
    
    Responsibilities:
    1. Make strategic decisions about products and priorities
    2. Approve high-impact changes (architecture, budget, client-facing)
    3. Resolve conflicts between teams/agents
    4. Set company vision and goals
    5. Final approval for production deployments
    
    Decision Framework:
    - Business value > Technical elegance
    - Customer impact is the primary metric
    - Security and reliability are non-negotiable
    - When in doubt, consult CTO for technical input
    
    You do NOT:
    - Write code
    - Do detailed technical design
    - Handle day-to-day task assignment (that's PM's job)
    """,
    
    "tools": [
        "approve_deployment",
        "set_priority",
        "resolve_conflict",
        "broadcast_announcement",
        "request_report"
    ],
    
    "receives_from": ["CTO", "PM", "Security (escalations)"],
    "sends_to": ["CTO", "PM", "All (announcements)"],
    "authority": "EXECUTIVE — can override any decision"
}
```

### 3.2 PM Agent

```python
PM_AGENT = {
    "name": "PM Agent",
    "role": "Project Manager",
    "llm": "gpt-4o",
    
    "system_prompt": """
    You are the Project Manager of the engineering team.
    
    Responsibilities:
    1. Receive requirements and break down into tasks
    2. Create user stories with clear acceptance criteria
    3. Assign tasks to appropriate agents
    4. Track progress and manage timeline
    5. Report status to CEO/CTO
    6. Facilitate communication between agents
    
    Task Decomposition Rules:
    - Each task should be completable in < 4 hours
    - Include clear acceptance criteria
    - Specify dependencies between tasks
    - Assign priority (P0-P3) based on business value
    
    Assignment Rules:
    - Backend APIs → Backend Dev Agent
    - UI work → Frontend Dev Agent + Designer Agent
    - Infrastructure → DevOps Agent
    - After coding → QA Agent for review
    - Security-sensitive → Security Agent review required
    
    Output Format:
    Task ID: TASK-{number}
    Title: {clear, concise title}
    Assigned to: {agent_name}
    Priority: P{0-3}
    Dependencies: [TASK-xxx, ...]
    Acceptance Criteria:
    - [ ] {criterion 1}
    - [ ] {criterion 2}
    ETA: {estimated hours}
    """,
    
    "tools": [
        "create_task",
        "assign_task",
        "update_task_status",
        "get_agent_workload",
        "create_sprint",
        "generate_status_report"
    ]
}
```

### 3.3 Backend Dev Agent

```python
BACKEND_DEV_AGENT = {
    "name": "Backend Dev Agent",
    "role": "Senior Backend Developer",
    "llm": "gpt-4o",
    
    "system_prompt": """
    You are a Senior Backend Developer specializing in Python/FastAPI.
    
    Responsibilities:
    1. Write clean, production-quality backend code
    2. Design and implement REST APIs
    3. Write database models and migrations
    4. Implement business logic
    5. Write unit and integration tests
    6. Fix bugs reported by QA Agent
    
    Technical Stack:
    - Language: Python 3.11+
    - Framework: FastAPI
    - ORM: SQLAlchemy 2.0
    - Database: PostgreSQL
    - Cache: Redis
    - Queue: Celery + RabbitMQ
    - Testing: pytest
    
    Coding Standards:
    - Follow PEP 8
    - Type hints on all functions
    - Docstrings on all public methods
    - Unit test coverage > 80%
    - No hardcoded values (use config/env vars)
    - Handle errors properly (try/except, proper HTTP status codes)
    
    Workflow:
    1. Receive task → Confirm understanding
    2. Check existing code for patterns (RAG)
    3. Write implementation
    4. Write tests
    5. Self-review (check against standards)
    6. Send to QA Agent for review
    """,
    
    "tools": [
        "read_file",
        "write_file",
        "search_codebase",
        "run_tests",
        "run_linter",
        "query_database",
        "send_for_review"
    ]
}
```

### 3.4 QA Agent

```python
QA_AGENT = {
    "name": "QA Agent",
    "role": "Quality Assurance Engineer",
    "llm": "gpt-4o",
    
    "system_prompt": """
    You are a meticulous QA Engineer. Your job is to find bugs 
    and ensure code quality BEFORE it reaches production.
    
    Review Checklist:
    1. Code Quality:
       - [ ] Follows coding standards
       - [ ] No code smells or anti-patterns
       - [ ] Proper error handling
       - [ ] No hardcoded secrets/values
    
    2. Functionality:
       - [ ] Meets acceptance criteria
       - [ ] Edge cases handled
       - [ ] Input validation present
       - [ ] Business logic correct
    
    3. Testing:
       - [ ] Unit tests present and passing
       - [ ] Coverage > 80%
       - [ ] Edge case tests
       - [ ] Error scenario tests
    
    4. Security:
       - [ ] No SQL injection
       - [ ] No XSS vulnerabilities
       - [ ] Authentication/authorization correct
       - [ ] Sensitive data not logged
    
    5. Performance:
       - [ ] No N+1 queries
       - [ ] Proper pagination
       - [ ] Efficient algorithms
    
    Output:
    - PASS: Code approved with optional minor suggestions
    - PASS WITH CHANGES: Code needs small fixes (list them)
    - FAIL: Code has critical issues (list with severity)
    
    Be constructive. Explain WHY something is wrong and HOW to fix it.
    """,
    
    "tools": [
        "read_file",
        "run_tests",
        "run_linter",
        "run_security_scan",
        "check_coverage",
        "create_bug_report",
        "approve_code"
    ]
}
```

---

## 4. Communication Flows

### 4.1 Normal Development Flow

```
Feature Development Flow:

1. CEO/CTO: "Build user authentication system"
        │
        ▼
2. PM Agent:
   ├── Decomposes into 5 tasks
   ├── TASK-001: DB models (Backend Dev)
   ├── TASK-002: Auth endpoints (Backend Dev)
   ├── TASK-003: Login page (Frontend Dev + Designer)
   ├── TASK-004: E2E tests (QA)
   └── TASK-005: Deploy (DevOps)
        │
        ▼
3. Designer Agent → Creates login page wireframe
   └── Sends design spec to Frontend Dev & PM
        │
        ▼
4. Backend Dev Agent → Implements API
   ├── Reads existing patterns (RAG)
   ├── Writes code + tests
   ├── Self-reviews
   └── Sends to QA Agent
        │
        ▼
5. QA Agent → Reviews code
   ├── PASS → Notify DevOps
   └── FAIL → Send back to Dev with feedback
        │ (possible loop 2-3 times)
        ▼
6. Security Agent → Security review
   ├── Scan for vulnerabilities
   └── PASS → Continue / FAIL → Back to Dev
        │
        ▼
7. DevOps Agent → Deploy to staging
   └── Run smoke tests
        │
        ▼
8. CEO Agent → Approve production deploy
        │
        ▼
9. DevOps Agent → Deploy to production
        │
        ▼
10. Documentation Agent → Update API docs
        │
        ▼
11. PM Agent → Mark tasks complete, update status
```

### 4.2 Bug Fix Flow

```
Bug Fix Flow:

1. Support Agent: "Customer reports login failure"
        │
        ▼
2. Support Agent → Triage:
   ├── Severity: P1 (critical)
   ├── Reproduce steps captured
   └── Notify PM + Backend Dev
        │
        ▼
3. PM Agent:
   ├── Create TASK-BUG-001
   ├── Priority: P1
   └── Assign to Backend Dev Agent
        │
        ▼
4. Backend Dev Agent:
   ├── Read error logs (tool: read_logs)
   ├── Search codebase (tool: search_code)
   ├── Identify root cause
   ├── Write fix + regression test
   └── Send to QA
        │
        ▼
5. QA Agent → Verify fix + regression
        │
        ▼
6. DevOps → Hotfix deploy
        │
        ▼
7. Support Agent → Notify customer
```

---

## 5. Decision Authority Matrix

### 5.1 RACI Matrix

```
RACI: R=Responsible, A=Accountable, C=Consulted, I=Informed

┌────────────────────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ Decision           │CEO │CTO │PM  │Dev │QA  │DevO│Sec │Doc │
├────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ Product strategy   │ A  │ C  │ R  │ I  │ I  │ I  │ I  │ I  │
│ Tech architecture  │ I  │ A  │ C  │ R  │ C  │ C  │ C  │ I  │
│ Task assignment    │ I  │ I  │ A/R│ I  │ I  │ I  │ I  │ I  │
│ Code quality       │    │ I  │ I  │ R  │ A  │    │ C  │    │
│ Security review    │    │ C  │ I  │ R  │ I  │ I  │ A  │    │
│ Production deploy  │ A  │ C  │ I  │ I  │ C  │ R  │ C  │ I  │
│ Staging deploy     │    │ I  │ I  │ I  │ I  │ A/R│    │    │
│ Bug prioritization │ I  │ C  │ A  │ C  │ R  │ I  │ I  │ I  │
│ API documentation  │    │ I  │ C  │ C  │    │    │    │ A/R│
│ Customer response  │ I  │    │ I  │ C  │    │    │    │ R  │
└────────────────────┴────┴────┴────┴────┴────┴────┴────┴────┘

A = Accountable (quyết định cuối cùng)
R = Responsible (thực hiện)
C = Consulted (tham vấn ý kiến)
I = Informed (được thông báo kết quả)
```

### 5.2 Auto-Approval vs Human-Approval

```
Auto-Approved (no human needed):
├── Code lint fixes
├── Unit test execution
├── Documentation generation
├── Staging deployment
├── Bug triage (P2-P4)
├── Task assignment (within team)
└── Status report generation

Human Approval Required:
├── 🔴 Production deployment
├── 🔴 Database migration (with data)
├── 🔴 Security policy changes
├── 🟡 Architecture decisions (if cost > $1000/month)
├── 🟡 New technology adoption
├── 🟡 P0/P1 bug fixes (hotfix)
└── 🟡 Customer-facing changes
```

---

## 6. End-to-End Workflows

### 6.1 New Feature — Full Example

```
User Input: "Build a password reset feature with email verification"

═══════════════════════════════════════════════════════════
STEP 1: PM Agent decomposes task
═══════════════════════════════════════════════════════════

PM Agent Output:
┌─────────────────────────────────────────────────┐
│ Feature: Password Reset with Email Verification  │
│ Sprint: Sprint 5                                 │
│ Total Estimate: 12 hours                         │
│                                                  │
│ TASK-101: Design password reset flow             │
│ ├── Agent: Designer                              │
│ ├── Priority: P1                                 │
│ ├── Estimate: 2h                                 │
│ └── AC: Wireframe for forgot/reset pages         │
│                                                  │
│ TASK-102: Password reset API endpoints           │
│ ├── Agent: Backend Dev                           │
│ ├── Priority: P1                                 │
│ ├── Dependencies: TASK-101                       │
│ ├── Estimate: 4h                                 │
│ └── AC:                                          │
│     ├── POST /api/auth/forgot-password           │
│     ├── POST /api/auth/reset-password            │
│     ├── Token expires in 1 hour                  │
│     ├── Rate limit: 3 requests/hour/email        │
│     └── Unit tests with > 90% coverage           │
│                                                  │
│ TASK-103: Reset password UI pages                │
│ ├── Agent: Frontend Dev                          │
│ ├── Dependencies: TASK-101, TASK-102             │
│ ├── Estimate: 3h                                 │
│ └── AC: Forgot password page, reset form         │
│                                                  │
│ TASK-104: E2E testing                            │
│ ├── Agent: QA                                    │
│ ├── Dependencies: TASK-102, TASK-103             │
│ └── Estimate: 2h                                 │
│                                                  │
│ TASK-105: Deploy & docs                          │
│ ├── Agent: DevOps + Documentation                │
│ ├── Dependencies: TASK-104                       │
│ └── Estimate: 1h                                 │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
STEP 2-7: Agents execute tasks (parallel where possible)
═══════════════════════════════════════════════════════════

Timeline:
Hour 0-2:   Designer creates wireframes ──────────────┐
Hour 0-2:   Backend Dev reviews existing auth code     │
Hour 2-6:   Backend Dev implements API ────────────────┤
Hour 2-5:   Frontend Dev implements UI ────────────────┤
Hour 6-7:   Security Agent reviews ────────────────────┤
Hour 7-9:   QA Agent tests (API + E2E) ───────────────┤
Hour 9-10:  DevOps deploys to staging                  │
Hour 10:    CEO approves production deploy              │
Hour 10-11: DevOps deploys to production               │
Hour 11-12: Docs Agent updates API documentation ──────┘

═══════════════════════════════════════════════════════════
STEP 8: PM Agent generates completion report
═══════════════════════════════════════════════════════════

PM Report:
✅ Feature "Password Reset" completed in 11.5 hours
✅ All 5 tasks closed
✅ Code coverage: 92%
✅ Security review: PASSED
✅ E2E tests: 8/8 passing
✅ Deployed to production
✅ API docs updated
```

---

## 7. Escalation & Fallback

### 7.1 Escalation Paths

```
Escalation Paths:

Level 1: Intra-agent retry
├── Agent retries task with different approach
├── Max 3 retries
└── If still failing → Level 2

Level 2: Peer consultation
├── Agent asks another agent for help
├── Dev Agent asks CTO Agent for architecture guidance
└── If still failing → Level 3

Level 3: Supervisor escalation
├── Escalate to manager (PM → CTO → CEO)
├── Manager reviews and re-routes
└── If still failing → Level 4

Level 4: Human escalation
├── Request human intervention
├── Provide full context and attempts made
└── Human resolves and feeds back to agents
```

### 7.2 Fallback Strategies

```
Fallback Strategies:

1. DEGRADED MODE
   - If primary agent fails → use simpler agent
   - GPT-4o fails → fallback to GPT-4o-mini
   - Complex approach fails → use simple approach

2. SKIP & CONTINUE
   - If non-critical task fails → skip and continue
   - Mark as "needs_manual_review"

3. ROLLBACK
   - If deployment fails → auto-rollback
   - If code breaks tests → revert to last good state

4. QUEUE & RETRY LATER
   - If service is unavailable → queue task
   - Retry when service recovers
```

---

## 8. Cost Optimization

### 8.1 LLM Cost Management

```
Cost Optimization Strategies:

1. TIERED LLM USAGE
   ├── Critical thinking (CEO, architecture): GPT-4o ($)
   ├── Code generation (Dev): GPT-4o ($)
   ├── Simple tasks (docs, formatting): GPT-4o-mini ($$$→$)
   └── Impact: ~40% cost reduction

2. CACHING
   ├── Cache common LLM responses
   ├── Cache RAG retrieval results
   ├── Cache code patterns
   └── Impact: ~30% cost reduction

3. PROMPT OPTIMIZATION
   ├── Shorter prompts = cheaper
   ├── Remove redundant instructions
   ├── Use few-shot over long explanations
   └── Impact: ~15% cost reduction

4. SMART ROUTING
   ├── Simple questions → small model
   ├── Complex reasoning → large model
   ├── Classification model decides routing
   └── Impact: ~25% cost reduction

5. BATCH PROCESSING
   ├── Group similar tasks
   ├── Single context = multiple outputs
   └── Impact: ~20% cost reduction

Estimated Monthly Cost (10 features/month):
├── All GPT-4o: ~$500/month
├── Tiered + cached: ~$150/month
└── With all optimizations: ~$80/month
```

---

**Tiếp theo:** [Bài 7: Implementation Guide — LangGraph →](./07-Implementation-LangGraph.md)
