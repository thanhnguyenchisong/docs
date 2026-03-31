# Bài 1: Multi-Agent Systems — Lý thuyết nền tảng

## Mục lục
- [1. Agent là gì?](#1-agent-là-gì)
- [2. Properties của Agent](#2-properties-của-agent)
- [3. Multi-Agent Systems (MAS)](#3-multi-agent-systems-mas)
- [4. Agent Communication](#4-agent-communication)
- [5. Coordination Models](#5-coordination-models)
- [6. Single Agent vs Multi-Agent](#6-single-agent-vs-multi-agent)
- [7. Agentic AI — Thế hệ mới](#7-agentic-ai--thế-hệ-mới)
- [8. Real-world Multi-Agent Applications](#8-real-world-multi-agent-applications)

---

## 1. Agent là gì?

### 1.1 Định nghĩa

> **Agent** = Một entity tự trị (autonomous) có khả năng **nhận thức** môi trường (perceive), **suy luận** (reason), và **hành động** (act) để đạt mục tiêu cụ thể.

```
Classic Agent Model (Russell & Norvig):

    ┌─────────────────────────────────────────────┐
    │               ENVIRONMENT                    │
    │                                              │
    │  ┌────────┐  Percepts  ┌────────────────┐   │
    │  │Sensors ├───────────→│                │   │
    │  └────────┘            │    AGENT       │   │
    │                        │                │   │
    │  ┌────────┐  Actions   │  ┌──────────┐  │   │
    │  │Actuators├←──────────│  │ Decision  │  │   │
    │  └────────┘            │  │ Function  │  │   │
    │                        │  └──────────┘  │   │
    │                        └────────────────┘   │
    └─────────────────────────────────────────────┘

AI Agent Model (2024+):

    ┌─────────────────────────────────────────────┐
    │               ENVIRONMENT                    │
    │   (APIs, Databases, Files, Web, Users)       │
    │                                              │
    │  ┌───────────┐        ┌──────────────────┐  │
    │  │ Perception│        │    AI AGENT       │  │
    │  │ ├── User Input     │                   │  │
    │  │ ├── API Response   │  ┌─────────────┐  │  │
    │  │ ├── Events     ───→│  │    LLM      │  │  │
    │  │ └── Observations   │  │ (Brain)     │  │  │
    │  └───────────┘        │  └──────┬──────┘  │  │
    │                       │         │         │  │
    │  ┌───────────┐        │  ┌──────┴──────┐  │  │
    │  │  Actions  │        │  │   Tools     │  │  │
    │  │ ├── API calls  ←───│  │ ├── Search  │  │  │
    │  │ ├── Code exec      │  │ ├── Code    │  │  │
    │  │ ├── File write     │  │ ├── DB      │  │  │
    │  │ └── Messages       │  │ └── Email   │  │  │
    │  └───────────┘        │  └─────────────┘  │  │
    │                       │         │         │  │
    │                       │  ┌──────┴──────┐  │  │
    │                       │  │  Memory     │  │  │
    │                       │  │ ├── Short   │  │  │
    │                       │  │ ├── Long    │  │  │
    │                       │  │ └── Shared  │  │  │
    │                       │  └─────────────┘  │  │
    │                       └──────────────────┘  │
    └─────────────────────────────────────────────┘
```

### 1.2 AI Agent vs Traditional Software

| Aspect | Traditional Software | AI Agent |
|--------|---------------------|----------|
| **Logic** | Hard-coded rules | LLM-based reasoning |
| **Input** | Structured (forms/API) | Natural language + structured |
| **Flexibility** | Fixed workflows | Dynamic, adaptive |
| **Error handling** | Try-catch, predefined | Self-correction, retry with reasoning |
| **Learning** | Code updates needed | In-context learning, memory |
| **Interaction** | Request-Response | Autonomous, multi-step |

---

## 2. Properties của Agent

### 2.1 Core Properties (Wooldridge & Jennings)

```
4 Properties cốt lõi của Agent:

┌──────────────────────────────────────────────────────────┐
│ 1. AUTONOMY (Tự trị)                                     │
│    Agent hoạt động mà KHÔNG cần con người can thiệp       │
│    liên tục. Tự đưa ra quyết định dựa trên goals.        │
│                                                           │
│    Ví dụ: Dev Agent tự viết code khi nhận được task,      │
│    không cần hỏi human ở mỗi bước.                       │
├──────────────────────────────────────────────────────────┤
│ 2. REACTIVITY (Phản ứng)                                  │
│    Agent nhận thức thay đổi môi trường và phản ứng        │
│    kịp thời.                                              │
│                                                           │
│    Ví dụ: QA Agent detect build failure → tự tạo          │
│    bug report → notify Dev Agent.                         │
├──────────────────────────────────────────────────────────┤
│ 3. PROACTIVITY (Chủ động)                                 │
│    Agent KHÔNG chỉ phản ứng mà CÒN chủ động hành động    │
│    để đạt mục tiêu.                                       │
│                                                           │
│    Ví dụ: Security Agent chủ động scan code mới push,     │
│    không đợi ai yêu cầu.                                 │
├──────────────────────────────────────────────────────────┤
│ 4. SOCIAL ABILITY (Giao tiếp)                             │
│    Agent giao tiếp và collaborate với agents khác          │
│    và/hoặc con người.                                     │
│                                                           │
│    Ví dụ: Dev Agent nhận task từ PM Agent, gửi code       │
│    cho QA Agent review, nhận feedback và fix.             │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Extended Properties cho AI Agents

```
Extended Properties:

5. REASONING (Suy luận)
   └── Khả năng phân tích, suy luận logic
   └── Chain-of-Thought, Tree-of-Thought
   └── Planning: phân tích task → tạo plan → execute

6. TOOL USE (Sử dụng công cụ)
   └── Gọi APIs, chạy code, truy cập database
   └── Quyết định TOOL NÀO phù hợp cho task

7. MEMORY (Bộ nhớ)
   └── Nhớ context cuộc hội thoại (short-term)
   └── Nhớ kinh nghiệm trước (long-term)
   └── Chia sẻ knowledge với agents khác (shared memory)

8. SELF-REFLECTION (Tự đánh giá)
   └── Kiểm tra kết quả output
   └── Tự phát hiện lỗi và sửa
   └── Cải thiện qua feedback loops

9. DELEGATION (Ủy quyền)
   └── Phân chia sub-tasks cho agents khác
   └── Biết giới hạn bản thân → delegate
```

---

## 3. Multi-Agent Systems (MAS)

### 3.1 MAS là gì?

> **Multi-Agent System (MAS)** = Hệ thống gồm **nhiều agents tự trị** hoạt động trong cùng environment, **tương tác** với nhau để giải quyết problems mà 1 agent đơn lẻ không thể (hoặc không nên) giải quyết.

### 3.2 MAS Architecture Patterns

```
1. FLAT / PEER-TO-PEER
   Mọi agent ngang hàng, giao tiếp trực tiếp

   Agent A ←→ Agent B ←→ Agent C
       ↕                     ↕
   Agent D ←→ Agent E ←→ Agent F

   ✅ Flexible, decentralized
   ❌ Khó quản lý khi nhiều agents, communication explosion

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. HIERARCHICAL / SUPERVISOR
   Manager agent điều phối worker agents

              ┌──────────────┐
              │  Supervisor  │
              │  Agent       │
              └──────┬───────┘
         ┌───────────┼───────────┐
   ┌─────┴──┐  ┌─────┴──┐  ┌────┴───┐
   │Worker A│  │Worker B│  │Worker C│
   └────────┘  └────────┘  └────────┘

   ✅ Clear authority, centralized control
   ❌ Single point of failure, bottleneck

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. HIERARCHICAL TEAMS
   Multi-level hierarchy, mỗi team có lead

              ┌──────────────┐
              │   CEO Agent  │
              └──────┬───────┘
         ┌───────────┼───────────┐
   ┌─────┴──────┐         ┌─────┴──────┐
   │ Tech Lead  │         │ PM Lead    │
   └─────┬──────┘         └─────┬──────┘
    ┌────┼────┐              ┌──┼──┐
    │    │    │              │     │
   Dev  QA  DevOps        BA   Design

   ✅ Scalable, realistic company structure
   ❌ Complex setup, latency

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. PIPELINE / SEQUENTIAL
   Agents xử lý tuần tự, output → input agent tiếp

   [Planner] → [Developer] → [Reviewer] → [Tester] → [Deployer]

   ✅ Simple, clear flow
   ❌ Không flexible, bottleneck

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. GRAPH-BASED / DYNAMIC
   Agents connected trong graph, routing dynamic

   ┌──────────────────────────────────────┐
   │           State Graph                 │
   │                                       │
   │  [Start] → [Planner] → {Decision}    │
   │                          ↓     ↓      │
   │                     [Dev]   [Research] │
   │                       ↓       ↓       │
   │                     [QA] ← [Merge]    │
   │                       ↓               │
   │                    [Deploy]            │
   │                       ↓               │
   │                    [End]              │
   └──────────────────────────────────────┘

   ✅ Most flexible, conditional routing
   ✅ LangGraph uses this pattern
   ❌ Complex to design
```

### 3.3 Khi nào cần Multi-Agent?

```
✅ NÊN dùng Multi-Agent khi:
├── Task phức tạp, cần nhiều skills khác nhau
├── Cần separation of concerns (mỗi agent chuyên 1 domain)
├── Cần scalability (thêm agents khi cần)
├── Cần parallel processing (nhiều tasks cùng lúc)
├── Real-world simulation (company, team, workflow)
└── Cần checks & balances (agent review agent khác)

❌ KHÔNG NÊN dùng Multi-Agent khi:
├── Task đơn giản, 1 agent đủ xử lý
├── Budget hạn chế (nhiều agents = nhiều LLM calls = đắt)
├── Latency quan trọng (multi-hop = chậm hơn)
├── Không cần diverse perspectives
└── Data sensitivity cao (ít agents = ít attack surface)
```

---

## 4. Agent Communication

### 4.1 Communication Types

```
Communication Types:

1. DIRECT MESSAGING
   Agent A gửi message trực tiếp cho Agent B
   
   Agent A: "Hey Dev Agent, viết function calculateTax()"
   Dev Agent: "Done. Here's the code: ..."
   Agent A: "Send to QA Agent for review"

2. BROADCAST
   Agent gửi message cho TẤT CẢ agents
   
   CEO Agent → ALL: "New project kickoff: E-commerce Platform"

3. PUBLISH/SUBSCRIBE (PUB/SUB)
   Agents subscribe topics, nhận messages relevant
   
   Topics: [code-review, deployment, bug-report, task-update]
   Dev Agent subscribes: [code-review, task-update]
   QA Agent subscribes: [bug-report, code-review]
   DevOps Agent subscribes: [deployment]

4. BLACKBOARD / SHARED STATE
   Tất cả agents đọc/ghi vào shared space
   
   ┌─────────────────────────────────┐
   │        SHARED STATE              │
   │ ├── project_plan: {...}          │
   │ ├── current_tasks: [...]         │
   │ ├── code_artifacts: {...}        │
   │ ├── test_results: {...}          │
   │ └── deployment_status: "ready"   │
   └─────────────────────────────────┘
         ↑↓        ↑↓        ↑↓
      Dev Agent  QA Agent  DevOps
```

### 4.2 Message Format

```python
# Standard Agent Message Structure:

message = {
    "id": "msg-2026-0331-001",
    "from": "pm_agent",
    "to": "dev_agent",            # hoặc "broadcast" / "team_backend"
    "timestamp": "2026-03-31T10:30:00Z",
    "type": "task_assignment",    # task, question, response, notification
    "priority": "high",
    "content": {
        "task_id": "TASK-042",
        "title": "Implement user authentication API",
        "description": "Create REST API endpoints for login, register, logout",
        "requirements": [
            "Use JWT tokens",
            "Rate limiting: 5 attempts/minute",
            "Password hashing: bcrypt"
        ],
        "deadline": "2026-04-02T17:00:00Z",
        "dependencies": ["TASK-040", "TASK-041"]
    },
    "context": {
        "project": "E-commerce Platform",
        "sprint": "Sprint 3",
        "tech_stack": ["Python", "FastAPI", "PostgreSQL"]
    },
    "metadata": {
        "retry_count": 0,
        "max_retries": 3,
        "timeout_seconds": 3600
    }
}
```

### 4.3 Communication Protocols

```
Protocols trong Multi-Agent:

1. REQUEST-RESPONSE
   A sends request → B processes → B sends response
   Simple, synchronous

2. CONTRACT NET PROTOCOL
   Manager announces task → Agents bid → Best bid wins
   Like an auction for tasks

   Manager: "Who can implement auth API?"
   Dev Agent 1: "I can, ETA 2 days"
   Dev Agent 2: "I can, ETA 1 day"
   Manager: "Dev Agent 2 wins" → assigns task

3. DELEGATION PROTOCOL
   Superior assigns to subordinate, monitors progress
   Like a real company hierarchy

4. CONSENSUS PROTOCOL
   Multiple agents vote/agree on a decision
   Used for code review: 2/3 agents approve → merge
```

---

## 5. Coordination Models

### 5.1 Cooperation vs Competition

```
COOPERATION (Hợp tác):
├── Agents chia sẻ goals chung
├── Chia task, mỗi agent 1 phần
├── Kết quả combine lại
└── Ví dụ: Dev team cùng build 1 feature

COMPETITION (Cạnh tranh):
├── Agents cùng solve 1 problem
├── Best solution được chọn
├── Increase diversity of solutions
└── Ví dụ: 3 Dev agents viết 3 solutions → pick best

NEGOTIATION (Đàm phán):
├── Agents có interests khác nhau
├── Negotiate để đạt agreement
├── Trade-offs & compromises
└── Ví dụ: Dev Agent muốn dùng tech mới,
    Security Agent yêu cầu stable tech → negotiate
```

### 5.2 Task Decomposition

```
Task Decomposition trong Multi-Agent:

Original Task: "Build E-commerce checkout feature"
                        │
                ┌───────┴───────┐
                │   PM Agent    │
                │  Decomposes   │
                └───────┬───────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───┴────────┐   ┌─────┴──────┐   ┌───────┴──────┐
│ Sub-task 1 │   │ Sub-task 2 │   │ Sub-task 3   │
│ Cart API   │   │ Payment    │   │ Order        │
│ CRUD ops   │   │ Gateway    │   │ Confirmation │
│            │   │ Integration│   │ Email        │
│ → Dev Agent│   │ → Dev Agent│   │ → Dev Agent  │
│   (Backend)│   │  (Payment) │   │  (Frontend)  │
└────────────┘   └────────────┘   └──────────────┘
        │                │                │
        └────────────────┴────────────────┘
                         │
                  ┌──────┴──────┐
                  │  QA Agent   │
                  │ Integration │
                  │    Test     │
                  └──────┬──────┘
                         │
                  ┌──────┴──────┐
                  │ DevOps Agent│
                  │   Deploy    │
                  └─────────────┘
```

---

## 6. Single Agent vs Multi-Agent

### 6.1 So sánh chi tiết

```
┌─────────────────┬──────────────────────┬───────────────────────┐
│                 │   SINGLE AGENT       │   MULTI-AGENT         │
├─────────────────┼──────────────────────┼───────────────────────┤
│ Complexity      │ Đơn giản             │ Phức tạp hơn          │
│ Cost            │ Ít LLM calls         │ Nhiều LLM calls       │
│ Latency         │ Nhanh                │ Chậm hơn (multi-hop)  │
│ Specialization  │ Jack-of-all-trades   │ Domain expert mỗi agent│
│ Quality         │ OK for simple tasks  │ Cao hơn (peer review) │
│ Scalability     │ Limited              │ Thêm agents dễ dàng   │
│ Reliability     │ Single point failure │ Redundancy possible   │
│ Maintenance     │ 1 prompt to manage   │ N prompts to manage   │
│ Debugging       │ Dễ trace             │ Khó hơn               │
│ Context window  │ 1 window, có thể tràn│ Chia nhỏ = vừa window│
│ Best for        │ Simple tasks         │ Complex workflows     │
└─────────────────┴──────────────────────┴───────────────────────┘
```

### 6.2 Decision Framework

```
Question Tree: Single vs Multi-Agent?

1. Task có cần nhiều skills khác nhau không?
   ├── Không → Single Agent
   └── Có → Continue ↓

2. 1 LLM context window đủ handle không?
   ├── Có → Single Agent (có thể)
   └── Không → Multi-Agent ↓

3. Cần checks & balances (review, validate)?
   ├── Không → Single Agent
   └── Có → Multi-Agent ↓

4. Budget cho LLM calls ok?
   ├── Hạn chế → Single Agent (optimize prompt)
   └── Ok → Multi-Agent ✅

→ RESULT: Multi-Agent cho IT Company ✅
  (nhiều roles, cần review, complex workflows)
```

---

## 7. Agentic AI — Thế hệ mới

### 7.1 Evolution of AI Systems

```
Evolution:

2020: Simple Chatbot
      └── 1 prompt → 1 response

2022: Chain-based AI (LangChain)
      └── Prompt 1 → LLM → Prompt 2 → LLM → Output

2023: ReAct Agent
      └── Thought → Action → Observation → loop

2024: Multi-Agent Systems
      └── Multiple agents collaborate on complex tasks

2025: Agentic AI (Current)
      └── Autonomous agents with planning, memory,
          tool-use, self-reflection, delegation

2026+: Company OS (Tương lai)
      └── AI agents = digital workforce
          Mỗi role trong company = 1 AI agent
          Human supervisors chỉ oversight
```

### 7.2 Agentic AI vs Traditional AI

```
Traditional AI Pipeline:
User → Prompt → LLM → Response → Done

Agentic AI:
User → Goal → Agent plans → Agent acts → Agent observes
  → Agent re-plans → Agent acts again → ... → Goal achieved

Key differences:
├── PLANNING: Agent tự lập plan, chia steps
├── ITERATION: Agent loop cho đến khi đạt goal
├── TOOL USE: Agent tự chọn tools phù hợp
├── SELF-CORRECTION: Agent tự sửa lỗi
└── AUTONOMY: Agent hoạt động tự trị
```

---

## 8. Real-world Multi-Agent Applications

### 8.1 Industry Examples

```
1. SOFTWARE DEVELOPMENT (ChatDev, MetaGPT)
   ├── CEO → design product
   ├── CTO → chọn tech stack
   ├── Developer → viết code
   ├── Tester → viết tests
   └── Reviewer → code review

2. RESEARCH (AI Scientist)
   ├── Literature Review Agent
   ├── Hypothesis Agent
   ├── Experiment Agent
   ├── Analysis Agent
   └── Writing Agent

3. CUSTOMER SUPPORT
   ├── Triage Agent → classify issue
   ├── Knowledge Agent → search FAQ/docs
   ├── Technical Agent → troubleshoot
   ├── Escalation Agent → human handoff
   └── Survey Agent → satisfaction

4. IT OPERATIONS (IT Company — chúng ta build cái này!)
   ├── PM Agent → plan & assign
   ├── Dev Agent → code
   ├── QA Agent → test
   ├── DevOps Agent → deploy
   ├── Security Agent → audit
   └── Support Agent → handle tickets
```

### 8.2 Key Academic Projects

| Project | Year | Mô tả |
|---------|------|--------|
| **ChatDev** | 2023 | Simulated software company with AI agents |
| **MetaGPT** | 2023 | Multi-agent framework with SOP |
| **AutoGen** | 2023 | Microsoft's conversational multi-agent |
| **CrewAI** | 2024 | Role-based AI agent teams |
| **LangGraph** | 2024 | Graph-based agent orchestration |
| **OpenAI Swarm** | 2024 | Lightweight multi-agent framework |
| **Magentic-One** | 2025 | Microsoft's general-purpose MAS |

---

## Tóm tắt chương

```
Key Takeaways:

1. Agent = entity tự trị + perceive + reason + act
2. 4 Core Properties: Autonomy, Reactivity, Proactivity, Social
3. MAS Patterns: Flat, Hierarchical, Pipeline, Graph-based
4. Communication: Direct, Broadcast, Pub/Sub, Shared State
5. Coordination: Cooperation, Competition, Negotiation
6. Multi-Agent phù hợp cho IT Company: nhiều roles, complex workflow
7. Agentic AI = agents tự planning + acting + self-correcting
```

---

**Tiếp theo:** [Bài 2: Agent Architecture & Design Patterns →](./02-Agent-Architecture.md)
