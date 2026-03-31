# 🏢 AI Company Agent — Multi-Agent System cho IT Company

Bộ tài liệu toàn diện về thiết kế, xây dựng và triển khai hệ thống **Multi-Agent AI** cho một công ty IT — nơi mỗi AI Agent có vai trò riêng biệt, giao tiếp với nhau và tự động hóa toàn bộ quy trình.

---

## 📚 Mục lục

### Lý thuyết (Theory)

1. **[Multi-Agent Systems — Lý thuyết nền tảng](./01-Multi-Agent-Theory.md)**
   - Agent là gì? Autonomy, Reactivity, Proactivity, Social ability
   - Multi-Agent Systems (MAS) architecture
   - Agent Communication Language (ACL)
   - Coordination models: Cooperation, Competition, Negotiation
   - Game Theory & Mechanism Design
   - So sánh: Single Agent vs Multi-Agent

2. **[Agent Architecture & Design Patterns](./02-Agent-Architecture.md)**
   - ReAct (Reasoning + Acting)
   - Chain-of-Thought / Tree-of-Thought
   - Plan-and-Execute
   - Tool-Use Agent
   - Reflexion & Self-Correction
   - Hierarchical Agent Teams
   - Supervisor Pattern

3. **[Communication & Orchestration](./03-Communication-Orchestration.md)**
   - Message Passing vs Shared Memory
   - Event-Driven Architecture
   - Pub/Sub pattern cho agents
   - State Machine & Graph-based orchestration
   - Human-in-the-Loop
   - Error handling & Recovery
   - Consensus & Conflict Resolution

### Công nghệ (Technology)

4. **[Technology Stack & Frameworks](./04-Technology-Stack.md)**
   - LangChain — Building blocks
   - LangGraph — Graph-based orchestration
   - CrewAI — Role-based agent teams
   - AutoGen (Microsoft) — Conversational agents
   - OpenAI Swarm — Lightweight multi-agent
   - Semantic Kernel — Enterprise AI
   - So sánh frameworks & Khi nào dùng cái nào

5. **[Memory, State & Knowledge](./05-Memory-State-Knowledge.md)**
   - Short-term Memory (conversation)
   - Long-term Memory (vector DB)
   - Episodic Memory (past experiences)
   - Shared Knowledge Base
   - State Management across agents
   - RAG cho Multi-Agent systems

### Thiết kế (Design)

6. **[IT Company Agent Blueprint](./06-Company-Blueprint.md)**
   - Thiết kế 12+ agents cho IT Company
   - Agent Roles & Responsibilities
   - Communication Flows
   - Decision Authority Matrix
   - End-to-end workflow examples
   - Escalation & Fallback patterns

7. **[Implementation Guide — LangGraph](./07-Implementation-LangGraph.md)**
   - Setup LangGraph project
   - Build từng agent step-by-step
   - State management
   - Multi-agent graph
   - Human-in-the-Loop
   - Production deployment

8. **[Implementation Guide — CrewAI](./08-Implementation-CrewAI.md)**
   - Setup CrewAI project
   - Define Agents, Tasks, Crews
   - Agent collaboration patterns
   - Custom tools
   - End-to-end IT Company example

9. **[Deployment & Production](./09-Deployment-Production.md)**
   - Containerization (Docker)
   - Observability & Monitoring
   - Cost optimization (LLM calls)
   - Security & Access Control
   - Scaling strategies
   - CI/CD cho AI agents

---

## 🎯 Hệ thống Agent trong IT Company

```
┌─────────────────────────────────────────────────────────────┐
│                    🏢 IT COMPANY AGENT SYSTEM               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ 👔 CEO Agent │  │ 📊 PM Agent  │  │ 🎨 Designer Agent│  │
│  │ Strategic     │  │ Project Mgmt │  │ UI/UX Design     │  │
│  │ Decisions     │  │ Task Planning│  │ Mockups          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                    │            │
│  ┌──────┴──────────────────┴────────────────────┴────────┐  │
│  │              📨 Message Bus / Orchestrator             │  │
│  └──────┬──────────────────┬────────────────────┬────────┘  │
│         │                  │                    │            │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌────────┴─────────┐  │
│  │ 💻 Dev Agent │  │ 🧪 QA Agent  │  │ 🔒 Security Agent│  │
│  │ Code Writing │  │ Testing      │  │ Audit & Scan     │  │
│  │ Code Review  │  │ Bug Reports  │  │ Compliance       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                    │            │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌────────┴─────────┐  │
│  │ 🏗️ DevOps   │  │ 📝 Doc Agent │  │ 🤖 Support Agent │  │
│  │ CI/CD, Infra │  │ Documentation│  │ Customer Support │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Lộ trình học

```
Phase 1: Theory (Tuần 1-2)
├── Bài 01: Multi-Agent Theory
├── Bài 02: Agent Architecture
└── Bài 03: Communication & Orchestration

Phase 2: Technology (Tuần 3-4)
├── Bài 04: Technology Stack & Frameworks
└── Bài 05: Memory, State & Knowledge

Phase 3: Design & Build (Tuần 5-8)
├── Bài 06: Company Agent Blueprint
├── Bài 07: Implementation (LangGraph)
├── Bài 08: Implementation (CrewAI)
└── Bài 09: Deployment & Production
```

## ✅ Checklist

### Lý thuyết
- [ ] Hiểu Agent properties (Autonomy, Reactivity, Social)
- [ ] Phân biệt Single Agent vs Multi-Agent
- [ ] Nắm được 5+ Agent Design Patterns
- [ ] Hiểu Communication protocols (message passing, shared state)
- [ ] Biết khi nào cần Human-in-the-Loop

### Công nghệ
- [ ] Setup và chạy được LangGraph project
- [ ] Setup và chạy được CrewAI project
- [ ] Tích hợp LLM (OpenAI, Claude, Gemini)
- [ ] Implement RAG cho agents
- [ ] Quản lý state & memory

### Thiết kế & Build
- [ ] Thiết kế blueprint cho IT Company
- [ ] Define roles cho 10+ agents
- [ ] Implement end-to-end workflow
- [ ] Deploy với Docker
- [ ] Monitoring & observability

---

## 📖 Tài liệu tham khảo

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen Documentation](https://microsoft.github.io/autogen/)
- [LangChain Documentation](https://docs.langchain.com/)
- [OpenAI Multi-Agent](https://platform.openai.com/)
- [Multi-Agent Systems — Wooldridge](https://www.cs.ox.ac.uk/people/michael.wooldridge/)

---

**Mục tiêu:** Xây dựng một hệ thống AI Agent hoàn chỉnh, nơi mỗi agent đóng vai trò như một nhân viên trong công ty IT — tự động collaborate, hoàn thành tasks, và communicate với nhau — **KHÔNG cần con người can thiệp** (trừ khi cần approval).
