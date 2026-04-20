# Anthropic Courses — Tổng hợp các khóa học chính thức

## 📚 Nguồn học chính thức từ Anthropic

Anthropic cung cấp tài liệu học qua **3 kênh chính**:

---

## 🗂️ Nội dung khóa học (Vietnamese Notes)

Các module dưới đây là ghi chú chi tiết bằng **tiếng Việt**, tổ chức theo cấu trúc 16 khóa chính thức trên [claude.com/resources/courses](https://claude.com/resources/courses).

### Foundation Layer

| # | Module | Mô tả | Files |
|---|--------|-------|-------|
| 01 | [**Claude 101**](01-claude-101/) | Giới thiệu cơ bản Claude, đăng ký, prompt đầu tiên | 1 |
| 09 | [**AI Fluency**](09-ai-fluency/) | AI cho educators, students, nonprofits, CRAFT framework | 1 |

### Builder Layer — Core

| # | Module | Mô tả | Files |
|---|--------|-------|-------|
| 02 | [**Building with the Claude API**](02-building-with-api/) | API, prompting, evals, tool use, RAG, features, MCP, agents | 10 |
| 03 | [**Claude Code 101**](03-claude-code-101/) | AI coding agent, agentic loop, CLAUDE.md, hooks | 6 |
| 04 | [**Subagents**](04-subagents/) | Delegate tasks, custom subagents, design patterns | 5 |
| 05 | [**Agent Skills**](05-agent-skills/) | SKILL.md, reusable instructions, sharing, troubleshooting | 6 |
| 06 | [**Claude Cowork**](06-claude-cowork/) | Task loop, plugins, file/research workflows | 6 |

### Infrastructure Layer — Advanced

| # | Module | Mô tả | Files |
|---|--------|-------|-------|
| 07 | [**MCP (Model Context Protocol)**](07-mcp/) | Servers, clients, tools, resources, prompts | 7 |
| 08 | [**Cloud Deployment**](08-cloud-deployment/) | AWS Bedrock, Google Vertex AI | 3 |

> **Tổng: 9 modules, ~45 files** markdown viết bằng tiếng Việt + code ví dụ Python.

---

## 1. 🎓 GitHub Courses (github.com/anthropics/courses)

> **Repo chính:** [https://github.com/anthropics/courses](https://github.com/anthropics/courses)
> ⭐ 20k stars | Jupyter Notebooks | Miễn phí

### 5 Khóa học (theo thứ tự nên học):

| # | Khóa học | Nội dung chính | Level |
|---|---------|----------------|-------|
| 1 | **[Anthropic API Fundamentals](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals)** | API key, model params, multimodal prompts, streaming | Beginner |
| 2 | **[Prompt Engineering Interactive Tutorial](https://github.com/anthropics/courses/tree/master/prompt_engineering_interactive_tutorial)** | 9 chapters: roles, CoT, XML tags, output format, avoiding hallucinations | Beginner → Intermediate |
| 3 | **[Real World Prompting](https://github.com/anthropics/courses/tree/master/real_world_prompting)** | Complex prompts cho production, real use cases | Intermediate |
| 4 | **[Prompt Evaluations](https://github.com/anthropics/courses/tree/master/prompt_evaluations)** | Đo lường quality prompts, eval frameworks | Intermediate → Advanced |
| 5 | **[Tool Use](https://github.com/anthropics/courses/tree/master/tool_use)** | Function calling, tool integration, workflows | Advanced |

---

## 2. 🏫 Anthropic Academy (claude.com/resources/courses)

> **Portal:** [https://claude.com/resources/courses](https://claude.com/resources/courses)
> **LMS:** [https://anthropic.skilljar.com/](https://anthropic.skilljar.com/)
> Self-paced | Video + Quiz | Certificates | Miễn phí

### 16 khóa chính thức:

```
FOUNDATION LAYER (Non-Technical):
├── Claude 101 — Giới thiệu cơ bản
├── AI Fluency: Framework & Foundations
├── AI Fluency for Students
├── AI Fluency for Educators
├── AI Fluency for Nonprofits
└── Teaching AI Fluency

BUILDER LAYER (Technical):
├── Building with the Claude API — KHÓA CHÍNH (toàn diện nhất)
│   ├── API Access, Multi-turn, System Prompts
│   ├── Temperature, Streaming, Structured Data
│   ├── Prompt Evaluation & Grading
│   ├── Prompt Engineering Techniques
│   ├── Tool Use (Client + Server tools)
│   ├── RAG & Agentic Search
│   ├── Features (Extended Thinking, Vision, PDF, Caching)
│   ├── Model Context Protocol
│   └── Agents & Workflows
├── Claude Code 101
├── Claude Code in Action
├── Introduction to Subagents
└── Introduction to Agent Skills

COWORK LAYER:
└── Introduction to Claude Cowork

INFRASTRUCTURE LAYER (Advanced):
├── Introduction to Model Context Protocol
├── MCP: Advanced Topics
├── Claude with Amazon Bedrock
└── Claude with Google Cloud's Vertex AI
```

---

## 3. 📖 Documentation & Cookbooks

### Anthropic Documentation
> [https://docs.anthropic.com/](https://docs.anthropic.com/)
```
├── Getting Started / Quickstart
├── Build with Claude
│   ├── Prompt Engineering Guide
│   ├── Prompt Library (pre-built prompts)
│   ├── Extended Thinking
│   ├── Tool Use
│   ├── Computer Use
│   ├── Vision
│   ├── Caching
│   ├── Batches
│   └── MCP (Model Context Protocol)
├── Agents
│   ├── Agent Design Patterns
│   ├── Tool Use for Agents
│   └── Building Effective Agents (guide)
└── API Reference
```

### Claude Cookbooks (GitHub)
> [https://github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)
```
├── RAG (Retrieval-Augmented Generation)
├── Tool use examples
├── Prompt chaining
├── Classification
├── Summarization
├── Data extraction
├── Code generation
└── Advanced patterns
```

---

## 🗺️ Lộ trình học đề xuất

```
WEEK 1: Fundamentals
├── Day 1: Claude 101 (01-claude-101/)
├── Day 2-3: API Access, Temperature, Streaming (02-building-with-api/ bài 1-2)
├── Day 4-5: Prompt Engineering + Evaluation (02-building-with-api/ bài 3-4)
└── Practice: Gọi API, viết prompts, chạy eval

WEEK 2: Tools & Features
├── Day 1-2: Tool Use (02-building-with-api/ bài 5)
├── Day 3: RAG (02-building-with-api/ bài 6)
├── Day 4: Extended Thinking, Vision, Caching (02-building-with-api/ bài 7)
├── Day 5: Agents & Workflows (02-building-with-api/ bài 9)
└── Practice: Build agentic pipeline với tool use

WEEK 3: Claude Code Ecosystem
├── Day 1-2: Claude Code 101 (03-claude-code-101/)
├── Day 3: Subagents (04-subagents/)
├── Day 4: Agent Skills (05-agent-skills/)
├── Day 5: Claude Cowork (06-claude-cowork/)
└── Practice: Setup Claude Code, tạo subagent + skill

WEEK 4: Infrastructure & Production
├── Day 1-3: MCP deep dive (07-mcp/)
├── Day 4: Cloud Deployment — Bedrock/Vertex (08-cloud-deployment/)
├── Day 5: Review & portfolio project
└── Practice: Build MCP server, deploy lên cloud
```

---

## 📎 Quick Links

| Resource | URL |
|----------|-----|
| Courses Portal | [claude.com/resources/courses](https://claude.com/resources/courses) |
| GitHub Courses | [github.com/anthropics/courses](https://github.com/anthropics/courses) |
| Anthropic Academy | [anthropic.skilljar.com](https://anthropic.skilljar.com/) |
| Documentation | [docs.anthropic.com](https://docs.anthropic.com/) |
| Prompt Library | [docs.anthropic.com/prompt-library](https://docs.anthropic.com/en/docs/build-with-claude/prompt-library) |
| Cookbooks | [github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) |
| API Reference | [docs.anthropic.com/api](https://docs.anthropic.com/en/api/) |
| Building Agents Guide | [docs.anthropic.com/agents](https://docs.anthropic.com/en/docs/build-with-claude/agents) |
